import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { LanguagePreference } from '../../common/constants/language-preference.constant';
import { UserRole } from '../../common/constants/roles.constant';
import { PASSWORD_MIN_LENGTH } from '../../common/constants/app.constants';

export class RegisterDto {
  @ApiProperty()
  @IsString()
  @MaxLength(120)
  name!: string;

  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(PASSWORD_MIN_LENGTH)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: 'Password must include at least one letter and one number',
  })
  password!: string;

  @ApiPropertyOptional({ enum: UserRole, default: UserRole.CUSTOMER })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ enum: LanguagePreference, default: LanguagePreference.EN })
  @IsOptional()
  @IsEnum(LanguagePreference)
  languagePreference?: LanguagePreference;
}
