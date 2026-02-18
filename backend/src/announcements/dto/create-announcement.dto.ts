import {
  IsString,
  IsNotEmpty,
  IsArray,
  ArrayMinSize,
  IsInt,
  Matches,
} from 'class-validator';

export class CreateAnnouncementDto {
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Content is required' })
  content: string;

  @IsString()
  @IsNotEmpty({ message: 'Publication date is required' })
  @Matches(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/, {
    message: 'Publication date must be in format MM/DD/YYYY HH:mm',
  })
  publicationDate: string;

  @IsArray({ message: 'Category IDs must be an array' })
  @ArrayMinSize(1, { message: 'At least one category is required' })
  @IsInt({ each: true, message: 'Each category ID must be an integer' })
  categoryIds: number[];
}
