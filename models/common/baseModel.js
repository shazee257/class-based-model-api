import { model } from "mongoose";
import ModelMethods from "./modelMethods.js";

export default class BaseModel extends ModelMethods {
    constructor(name, schema) {
        this.initializeModel(name, schema);
        super(this.model);
    }

    initializeModel(name, schema) {
        this.registerPlugins(schema);
        const model = this.compileModel(name, schema);
        this.setModel(model);
    }

    registerPlugins(schema) {
        schema.plugin(mongoosePlugin);
        schema.plugin(mongooseAggregatePlugin);
    }

    compileModel(name, schema) {
        return model(name, schema);
    }

    setModel(model) {
        this.model = model;
    }
}
