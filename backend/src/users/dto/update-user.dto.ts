import { ApiPropertyOptional } from '@nestjs/swagger';
import { LanguagePreference } from '../../common/constants/language-preference.constant';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional({ enum: LanguagePreference })
  @IsOptional()
  @IsEnum(LanguagePreference)
  languagePreference?: LanguagePreference;
}
