import 'dotenv/config';

import fs from 'node:fs/promises';
import path from 'node:path';
import mysql from 'mysql2/promise';
import { v2 as cloudinary } from 'cloudinary';

const MANIFEST_PATH = path.resolve(
  process.cwd(),
  'scripts',
  'output',
  'product-image-candidates.json',
);

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const SEARCH_DELAY_MS = 1200;
const LIMIT = Number(process.env.IMAGE_IMPORT_LIMIT ?? 50);

interface Product {
  id: string;
  name: string;
  slug: string;
}

interface ImageCandidate {
  productId: string;
  productName: string;
  slug: string;
  imageUrl: string;
  imageTitle: string;
  source: string;
  sourceUrl: string;
}

const requiredEnv = [
  'DB_HOST',
  'DB_USERNAME',
  'DB_DATABASE',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'SERPAPI_API_KEY',
];

for (const key of requiredEnv) {
  if (!process.env[key]?.trim()) {
    throw new Error(`Thiếu biến môi trường: ${key}`);
  }
}

// DB_PASSWORD được phép rỗng
if (process.env.DB_PASSWORD === undefined) {
  throw new Error('Thiếu biến môi trường: DB_PASSWORD');
}
const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_DATABASE,
  connectionLimit: 3,
  supportBigNumbers: true,
  bigNumberStrings: true,
  timezone: '+07:00',
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isValidImageUrl(value: string): boolean {
  try {
    const url = new URL(value);

    return (
      url.protocol === 'https:' &&
      !url.username &&
      !url.password &&
      !['localhost', '127.0.0.1', '0.0.0.0', '::1'].includes(
        url.hostname.toLowerCase(),
      )
    );
  } catch {
    return false;
  }
}

async function searchImage(product: Product): Promise<ImageCandidate | null> {
  const params = new URLSearchParams({
    engine: 'google_images',
    q: `${product.name} product official`,
    api_key: process.env.SERPAPI_API_KEY!,
    ijn: '0',
  });

  const response = await fetch(`https://serpapi.com/search.json?${params}`, {
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) {
    throw new Error(`SerpApi trả HTTP ${response.status}`);
  }

  const data = (await response.json()) as {
    error?: string;
    images_results?: Array<{
      original?: string;
      thumbnail?: string;
      title?: string;
      source?: string;
      link?: string;
    }>;
  };

  if (data.error) {
    throw new Error(data.error);
  }

  const results = data.images_results ?? [];

  // Chọn kết quả đầu tiên có URL HTTPS hợp lệ.
  // Đây là ứng viên tự động, chưa đảm bảo đúng model/màu sắc.
  for (const item of results.slice(0, 10)) {
    const imageUrl = item.original ?? item.thumbnail;

    if (!imageUrl || !isValidImageUrl(imageUrl)) {
      continue;
    }

    return {
      productId: product.id,
      productName: product.name,
      slug: product.slug,
      imageUrl,
      imageTitle: item.title ?? '',
      source: item.source ?? '',
      sourceUrl: item.link ?? '',
    };
  }

  return null;
}

async function downloadImageAsDataUri(url: string): Promise<string> {
  if (!isValidImageUrl(url)) {
    throw new Error('URL ảnh không hợp lệ');
  }

  const response = await fetch(url, {
    signal: AbortSignal.timeout(20_000),
    headers: {
      'User-Agent': 'ProductImageImporter/1.0',
      Accept: 'image/jpeg,image/png,image/webp,image/avif',
    },
  });

  if (!response.ok) {
    throw new Error(`Tải ảnh thất bại: HTTP ${response.status}`);
  }

  const contentType = (response.headers.get('content-type') ?? '')
    .split(';')[0]
    .trim()
    .toLowerCase();

  const allowedTypes: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/avif': 'avif',
  };

  if (!allowedTypes[contentType]) {
    throw new Error(`Định dạng ảnh không hỗ trợ: ${contentType}`);
  }

  const declaredSize = Number(response.headers.get('content-length') ?? 0);

  if (declaredSize > MAX_IMAGE_BYTES) {
    throw new Error('Ảnh vượt quá giới hạn 8 MB');
  }

  const buffer = Buffer.from(await response.arrayBuffer());

  if (buffer.length === 0 || buffer.length > MAX_IMAGE_BYTES) {
    throw new Error('Kích thước ảnh không hợp lệ');
  }

  // Không chỉ tin Content-Type: kiểm tra chữ ký file thực tế.
  const isJpeg =
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff;

  const isPng =
    buffer.length >= 8 &&
    buffer
      .subarray(0, 8)
      .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));

  const isWebp =
    buffer.length >= 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP';

  const isAvif =
    buffer.length >= 12 &&
    buffer.toString('ascii', 4, 8) === 'ftyp' &&
    buffer.toString('ascii', 8, 12).startsWith('avif');

  const signatureMatches =
    (contentType === 'image/jpeg' && isJpeg) ||
    (contentType === 'image/png' && isPng) ||
    (contentType === 'image/webp' && isWebp) ||
    (contentType === 'image/avif' && isAvif);

  if (!signatureMatches) {
    throw new Error('Nội dung file không khớp định dạng ảnh');
  }

  return `data:${contentType};base64,${buffer.toString('base64')}`;
}

async function uploadImage(candidate: ImageCandidate): Promise<string> {
  const dataUri = await downloadImageAsDataUri(candidate.imageUrl);

  // Dùng ID sản phẩm làm public_id ổn định.
  // Chạy lại không tạo asset mới với tên ngẫu nhiên.
  const publicId = `products/${candidate.productId}`;

  try {
    const result = await cloudinary.uploader.upload(dataUri, {
      public_id: publicId,
      overwrite: false,
      resource_type: 'image',
      tags: ['product-import'],
      context: {
        product_id: candidate.productId,
        product_name: candidate.productName.slice(0, 200),
      },
    });

    return result.secure_url;
  } catch (error) {
    // Có thể lần chạy trước đã upload thành công nhưng
    // chưa kịp insert DB. Tái sử dụng asset nếu nó tồn tại.
    try {
      const existing = await cloudinary.api.resource(publicId, {
        resource_type: 'image',
      });

      return existing.secure_url;
    } catch {
      throw error;
    }
  }
}

async function saveImage(
  candidate: ImageCandidate,
  imageUrl: string,
): Promise<'inserted' | 'skipped'> {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [products] = await connection.execute(
      `SELECT id
       FROM products
       WHERE id = ? AND deleted_at IS NULL
       FOR UPDATE`,
      [candidate.productId],
    );

    if ((products as unknown[]).length === 0) {
      await connection.rollback();
      throw new Error('Sản phẩm không còn tồn tại');
    }

    const [images] = await connection.execute(
      `SELECT id
       FROM product_images
       WHERE product_id = ?
       LIMIT 1`,
      [candidate.productId],
    );

    if ((images as unknown[]).length > 0) {
      await connection.commit();
      return 'skipped';
    }

    await connection.execute(
      `INSERT INTO product_images
         (product_id, image_url, alt_text, sort_order, is_primary)
       VALUES (?, ?, ?, 0, TRUE)`,
      [candidate.productId, imageUrl, candidate.productName.slice(0, 255)],
    );

    await connection.commit();
    return 'inserted';
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function generateManifest() {
  const [rows] = await db.execute(
    `SELECT
       CAST(p.id AS CHAR) AS id,
       p.name,
       p.slug
     FROM products p
     WHERE p.deleted_at IS NULL
       AND NOT EXISTS (
         SELECT 1
         FROM product_images pi
         WHERE pi.product_id = p.id
       )
     ORDER BY p.id
     LIMIT ?`,
    [LIMIT],
  );

  const products = rows as Product[];
  const candidates: ImageCandidate[] = [];


  for (const product of products) {
    try {
      const candidate = await searchImage(product);

      if (candidate) {
        candidates.push(candidate);
        console.log(
          `[FOUND] ${product.id} - ${product.name} | ${candidate.imageTitle}`,
        );
      } else {
        console.log(`[NO IMAGE] ${product.id} - ${product.name}`);
      }
    } catch (error) {
      console.error(
        `[SEARCH ERROR] ${product.id}:`,
        error instanceof Error ? error.message : error,
      );
    }

    await sleep(SEARCH_DELAY_MS);
  }

  await fs.mkdir(path.dirname(MANIFEST_PATH), {
    recursive: true,
  });

  await fs.writeFile(
    MANIFEST_PATH,
    JSON.stringify(candidates, null, 2),
    'utf8',
  );

  console.log(`\nĐã lưu ${candidates.length} ứng viên:`);
  console.log(MANIFEST_PATH);
  console.log('Kiểm tra manifest trước khi chạy --apply.');
}

async function applyManifest() {
  const content = await fs.readFile(MANIFEST_PATH, 'utf8');
  const candidates = JSON.parse(content) as ImageCandidate[];

  let inserted = 0;
  let skipped = 0;
  let failed = 0;

  for (const candidate of candidates) {
    try {
      if (
        !candidate.productId ||
        !candidate.productName ||
        !isValidImageUrl(candidate.imageUrl)
      ) {
        throw new Error('Dữ liệu ứng viên không hợp lệ');
      }

      // Kiểm tra lại trạng thái DB trước khi upload.
      const [existingRows] = await db.execute(
        `SELECT 1
         FROM product_images
         WHERE product_id = ?
         LIMIT 1`,
        [candidate.productId],
      );

      if ((existingRows as unknown[]).length > 0) {
        skipped++;
        console.log(`[SKIP] ${candidate.productName}: đã có ảnh`);
        continue;
      }

      const imageUrl = await uploadImage(candidate);
      const result = await saveImage(candidate, imageUrl);

      if (result === 'inserted') {
        inserted++;
        console.log(`[OK] ${candidate.productName}: ${imageUrl}`);
      } else {
        skipped++;
        console.log(`[SKIP] ${candidate.productName}: đã có ảnh`);
      }
    } catch (error) {
      failed++;
      console.error(
        `[FAILED] ${candidate.productName}:`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  console.log('\n===== KẾT QUẢ =====');
  console.log({ inserted, skipped, failed });
}

async function main() {
  try {
    if (process.argv.includes('--apply')) {
      await applyManifest();
    } else {
      await generateManifest();
    }
  } finally {
    await db.end();
  }
}

main().catch((error) => {
  console.error('Import thất bại:', error);
  process.exitCode = 1;
});
