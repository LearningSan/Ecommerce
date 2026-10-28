import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('product_variant_attributes')
export class ProductVariantAttributeEntity {
  @PrimaryColumn({
    type: 'bigint',
    unsigned: true,
    name: 'variant_id',
  })
  variantId: string;

  @PrimaryColumn({
    type: 'bigint',
    unsigned: true,
    name: 'attribute_value_id',
  })
  attributeValueId: string;
}
