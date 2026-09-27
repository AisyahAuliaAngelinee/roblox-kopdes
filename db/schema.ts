import {sqliteTable,text,integer,index} from 'drizzle-orm/sqlite-core';
export const profiles=sqliteTable('kopdes_profiles',{userId:text('user_id').primaryKey(),data:text('data').notNull(),version:integer('version').notNull().default(0),updatedAt:integer('updated_at').notNull()});

export const orders=sqliteTable('kopdes_orders',{id:text('id').primaryKey(),owner:text('owner').notNull(),data:text('data').notNull(),status:text('status').notNull(),paidAt:integer('paid_at'),completedAt:integer('completed_at'),invoiceId:text('invoice_id'),url:text('url'),createdAt:integer('created_at').notNull()},t=>[index('idx_orders_owner_created').on(t.owner,t.createdAt)]);

export const catalogSnapshot=sqliteTable('kopdes_catalog_snapshot',{id:text('id').primaryKey(),price:integer('price').notNull(),stock:integer('stock').notNull()});
export const catalogEvents=sqliteTable('kopdes_catalog_events',{id:text('id').primaryKey(),at:integer('at').notNull(),data:text('data').notNull()},t=>[index('idx_catalog_events_at').on(t.at)]);
export const notificationReads=sqliteTable('kopdes_notification_reads',{owner:text('owner').primaryKey(),readAt:integer('read_at').notNull()});
