import type {
  MutationCtx,
  QueryCtx,
} from "./../server";
import type { DataModelFromSchemaDefinition } from "convex/server";
import type { DocumentByName, TableNamesInDatabase } from "convex/server";
import schema from "../schema";

type DataModel = DataModelFromSchemaDefinition<typeof schema>;

export type Id<TableName extends TableNamesInDatabase<DataModel>> =
  string & { __tableName: TableName };

export type Doc<TableName extends TableNamesInDatabase<DataModel>> =
  DocumentByName<DataModel, TableName>;

export type TableNames = TableNamesInDatabase<DataModel>;
