import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MinLength } from 'class-validator';
import {
  PASSWORD_MIN_LENGTH,
} from '../../common/constants/app.constants';

export class UpdatePasswordDto {
  @ApiProperty()
  @IsString()
  oldPassword!: string;

  @ApiProperty()
  @IsString()
  @MinLength(PASSWORD_MIN_LENGTH)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: 'Password must include at least one letter and one number',
  })
  newPassword!: string;
}
