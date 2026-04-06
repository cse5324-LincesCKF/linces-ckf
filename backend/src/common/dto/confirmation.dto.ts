import { ApiProperty } from '@nestjs/swagger';
import { Equals } from 'class-validator';

export class ConfirmationDto {
  @ApiProperty({ example: true })
  @Equals(true, { message: 'Confirmation is required' })
  confirmed!: true;
}
