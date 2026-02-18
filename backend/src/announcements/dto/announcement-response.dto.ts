/**
 * Response shape for announcement endpoints.
 * Flattens the join-table categories into a clean array.
 */
export class CategoryResponseDto {
  id: number;
  name: string;
}

export class AnnouncementResponseDto {
  id: number;
  title: string;
  content: string;
  publicationDate: Date;
  createdAt: Date;
  updatedAt: Date;
  categories: CategoryResponseDto[];
}

/**
 * Maps a raw Prisma announcement (with nested join-table categories)
 * to a clean response DTO with a flat categories array.
 */
export function toAnnouncementResponse(announcement: {
  id: number;
  title: string;
  content: string;
  publicationDate: Date;
  createdAt: Date;
  updatedAt: Date;
  categories: { category: { id: number; name: string } }[];
}): AnnouncementResponseDto {
  return {
    id: announcement.id,
    title: announcement.title,
    content: announcement.content,
    publicationDate: announcement.publicationDate,
    createdAt: announcement.createdAt,
    updatedAt: announcement.updatedAt,
    categories: announcement.categories.map((ac) => ({
      id: ac.category.id,
      name: ac.category.name,
    })),
  };
}
