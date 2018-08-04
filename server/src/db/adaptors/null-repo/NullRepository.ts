import { Specification } from '../../specifications';
import { Repository } from '../../Repository';
import { Model, IModel } from '../../Model';
import { Query } from '../../Query';

export class NullRepository extends Repository {
    public async initialize() {
        return true;
    }

    public async listen() {
        return true;
    }

    public async close() {
        return true;
    }

    public async findAll<TModel extends Model>(entity: IModel<TModel>, query?: Query<TModel> | Specification<TModel>) {
        return [];
    }

    public async findOne<TModel extends Model>(entity: IModel<TModel>, query?: Query<TModel> | Specification<TModel>) {
        return null;
    }

    public async save<TModel extends Model>(entity: IModel<TModel>, ...models: TModel[]) {
        return null;
    }

    public async destroy<TModel extends Model>(entity: IModel<TModel>, ...models: TModel[]) {
        return true;
    }
}