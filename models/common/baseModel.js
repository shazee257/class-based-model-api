import { model } from "mongoose";
import { getAggregatedPaginatedData, getPaginatedData, mongooseAggregatePlugin, mongoosePlugin } from "mongoose-pagination-v2";

export default class BaseModel {
    constructor(name, schema) {
        this.#initializeModel(name, schema);
    }

    #initializeModel(name, schema) {
        this.#registerPlugins(schema);
        const model = this.#compileModel(name, schema);
        this.#setModel(model);
    }

    #registerPlugins(schema) {
        schema.plugin(mongoosePlugin);
        schema.plugin(mongooseAggregatePlugin);
    }

    #compileModel(name, schema) {
        return model(name, schema);
    }

    #setModel(model) {
        this.model = model;
    }

    // Create a document
    create(obj) {
        return this.model.create(obj);
    }

    // Get a document by query
    getOne(query) {
        return this.model.findOne(query);
    }

    // Get all documents with pagination
    async getAll({ query, page, limit }) {
        const { data, pagination } = await getPaginatedData({
            model: this.model,
            query,
            page,
            limit
        });

        return { data, pagination };
    }

    // Get all documents with aggregation and pagination
    async getAllAggregated({ query, page, limit, aggregate }) {
        const { data, pagination } = await getAggregatedPaginatedData({
            model: this.model,
            query,
            page,
            limit,
            aggregate
        });

        return { data, pagination };
    }

    // Update a document by ID
    updateById(id, obj) {
        return this.model.findByIdAndUpdate(id, obj, { new: true });
    }

    // Delete a document by ID
    deleteById(id) {
        return this.model.findByIdAndDelete(id);
    }
}
