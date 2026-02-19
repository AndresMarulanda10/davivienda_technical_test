import {
  IsString,
  IsNumber,
  IsUUID,
  IsUrl,
  IsOptional,
  Min,
  MinLength,
  MaxLength,
  IsInt,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name: string;

  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  description: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  price: number;

  @IsInt()
  @Min(0)
  stock: number;

  @IsUrl()
  imageUrl: string;

  @IsUUID()
  categoryId: string;
}
