import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsString, IsUrl, MaxLength, Min } from 'class-validator';

export class CreateQuoteDto {
  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiProperty()
  @IsString()
  @MaxLength(120)
  materialType!: string;

  @ApiProperty()
  @IsDateString()
  desiredDeliveryDate!: string;

  @ApiProperty()
  @IsString()
  customizationDescription!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  supportingDocumentUrl?: string;
}
