/* eslint-disable */
import type { DataModelFromSchemaDefinition } from "convex/server";
import schema from "../schema";

type DataModel = DataModelFromSchemaDefinition<typeof schema>;

export type Id<TableName extends keyof DataModel> = string & { __tableName: TableName };

export type Doc<TableName extends keyof DataModel> = DataModel[TableName];

export type TableNames = keyof DataModel;
