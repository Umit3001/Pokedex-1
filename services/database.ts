import * as SQLite from "expo-sqlite";

export interface FavoritePokemon {
  id: number;
  name: string;
  image_url: string;
  created_at: string;
}

class DatabaseService {
  private dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

  private async getDb(): Promise<SQLite.SQLiteDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = this.initDatabase();
    }
    return this.dbPromise;
  }

  private async initDatabase(): Promise<SQLite.SQLiteDatabase> {
    const db = await SQLite.openDatabaseAsync("pokedex.db");
    await this.createTables(db);
    return db;
  }

  private async createTables(db: SQLite.SQLiteDatabase): Promise<void> {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        image_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  async addFavorite(
    pokemonId: number,
    name: string,
    imageUrl?: string
  ): Promise<void> {
    if (!Number.isFinite(pokemonId) || pokemonId <= 0) {
      throw new Error("Invalid Pokemon ID");
    }

    try {
      const db = await this.getDb();
      await db.runAsync(
        "INSERT OR REPLACE INTO favorites (id, name, image_url) VALUES (?, ?, ?)",
        [pokemonId, name, imageUrl || ""]
      );
    } catch (error) {
      throw error;
    }
  }

  async removeFavorite(pokemonId: number): Promise<void> {
    if (!Number.isFinite(pokemonId) || pokemonId <= 0) {
      throw new Error("Invalid Pokemon ID");
    }

    try {
      const db = await this.getDb();
      await db.runAsync("DELETE FROM favorites WHERE id = ?", [pokemonId]);
    } catch (error) {
      throw error;
    }
  }

  async isFavorite(pokemonId: number): Promise<boolean> {
    if (!Number.isFinite(pokemonId) || pokemonId <= 0) {
      return false;
    }

    try {
      const db = await this.getDb();
      const result = await db.getFirstAsync<{ count: number }>(
        "SELECT COUNT(*) as count FROM favorites WHERE id = ?",
        [pokemonId]
      );
      return (result?.count || 0) > 0;
    } catch (error) {
      return false;
    }
  }

  async getAllFavorites(): Promise<FavoritePokemon[]> {
    try {
      const db = await this.getDb();
      const result = await db.getAllAsync<FavoritePokemon>(
        "SELECT * FROM favorites ORDER BY created_at DESC"
      );
      return result;
    } catch (error) {
      return [];
    }
  }
}

export const databaseService = new DatabaseService();