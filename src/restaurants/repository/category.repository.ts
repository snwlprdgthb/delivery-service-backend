import { EntityRepository, Repository } from 'typeorm';
import { Category } from '../entities/category.entity';

@EntityRepository(Category)
export class CategoryRepository extends Repository<Category> {
  async getOrCreate(name: string): Promise<Category> {
    let categoryName = name.trim().toLowerCase();
    let categorySlug = categoryName.replace(/ /g, '-');
    let category = await this.findOne({
      slug: categorySlug,
    });
    console.log(666);
    console.log(category);
    if (!category) {
      console.log('!!!!!CATEGORY');
      category = await this.save(
        this.create({ slug: categorySlug, name: categoryName }),
      );
    }
    return category;
  }
}
