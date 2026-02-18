import {
  IsString,
  IsNotEmpty,
  IsArray,
  ArrayMinSize,
  IsInt,
  MaxLength,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const DATE_REGEX = /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/;

@ValidatorConstraint({ name: 'isValidDateTime', async: false })
export class IsValidDateTimeConstraint implements ValidatorConstraintInterface {
  validate(value: string): boolean {
    if (typeof value !== 'string' || !DATE_REGEX.test(value)) return false;

    const [datePart, timePart] = value.split(' ');
    const [month, day, year] = datePart.split('/').map(Number);
    const [hours, minutes] = timePart.split(':').map(Number);

    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    if (year < 1900 || year > 2100) return false;
    if (hours < 0 || hours > 23) return false;
    if (minutes < 0 || minutes > 59) return false;

    // Verify the date actually exists (e.g. no Feb 30)
    const constructed = new Date(
      Date.UTC(year, month - 1, day, hours, minutes),
    );
    return (
      constructed.getUTCFullYear() === year &&
      constructed.getUTCMonth() === month - 1 &&
      constructed.getUTCDate() === day
    );
  }

  defaultMessage(): string {
    return 'Publication date must be a valid date/time in format MM/DD/YYYY HH:mm (e.g. 01/15/2025 09:30)';
  }
}

export class CreateAnnouncementDto {
  @ApiProperty({ example: 'Road Closure Notice', description: 'Announcement title' })
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  @MaxLength(255, { message: 'Title must be at most 255 characters' })
  title: string;

  @ApiProperty({ example: 'Main street will be closed for repairs from Monday.', description: 'Announcement content' })
  @IsString()
  @IsNotEmpty({ message: 'Content is required' })
  content: string;

  @ApiProperty({ example: '06/15/2025 10:00', description: 'Publication date in MM/DD/YYYY HH:mm format' })
  @IsString()
  @IsNotEmpty({ message: 'Publication date is required' })
  @Validate(IsValidDateTimeConstraint)
  publicationDate: string;

  @ApiProperty({ example: [1, 3], description: 'Array of category IDs', type: [Number] })
  @IsArray({ message: 'Category IDs must be an array' })
  @ArrayMinSize(1, { message: 'At least one category is required' })
  @IsInt({ each: true, message: 'Each category ID must be an integer' })
  categoryIds: number[];
}
