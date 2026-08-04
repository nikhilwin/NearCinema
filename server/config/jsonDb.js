import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');

// Ensure data directory exists
try {
  await fs.mkdir(DATA_DIR, { recursive: true });
} catch (err) {
  // Directory already exists or error
}

class JsonModel {
  constructor(filename) {
    this.filepath = path.join(DATA_DIR, filename);
  }

  async read() {
    try {
      const data = await fs.readFile(this.filepath, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      // If file doesn't exist, return empty array
      return [];
    }
  }

  async write(data) {
    await fs.writeFile(this.filepath, JSON.stringify(data, null, 2), 'utf8');
  }

  wrap(doc) {
    if (!doc) return null;
    const self = this;
    return {
      ...doc,
      async save() {
        const items = await self.read();
        const idx = items.findIndex(item => item._id === doc._id);
        if (idx !== -1) {
          items[idx] = { ...this };
          delete items[idx].save; // Clean up save function from stored data
          await self.write(items);
        }
        return this;
      }
    };
  }

  async find(query = {}) {
    const items = await this.read();
    const filtered = items.filter(item => {
      for (const key in query) {
        if (query[key] !== undefined && item[key] !== query[key]) {
          return false;
        }
      }
      return true;
    });
    return filtered.map(item => this.wrap(item));
  }

  async findOne(query = {}) {
    const items = await this.read();
    const found = items.find(item => {
      for (const key in query) {
        if (query[key] !== undefined && item[key] !== query[key]) {
          return false;
        }
      }
      return true;
    });
    return found ? this.wrap(found) : null;
  }

  async findById(id) {
    const items = await this.read();
    const found = items.find(item => item._id === id);
    return found ? this.wrap(found) : null;
  }

  async create(data) {
    const items = await this.read();
    const newDoc = {
      _id: Math.random().toString(36).substring(2, 11) + Date.now().toString(36),
      ...data,
      createdAt: new Date().toISOString()
    };
    items.push(newDoc);
    await this.write(items);
    return this.wrap(newDoc);
  }

  async findByIdAndUpdate(id, update, options = {}) {
    const items = await this.read();
    const idx = items.findIndex(item => item._id === id);
    if (idx === -1) return null;

    // Handle Mongoose-style $push or $set if needed, or simple overwrite
    let updatedDoc = { ...items[idx] };
    if (update.$push) {
      for (const key in update.$push) {
        if (!Array.isArray(updatedDoc[key])) {
          updatedDoc[key] = [];
        }
        updatedDoc[key].push(update.$push[key]);
      }
    }
    if (update.$set) {
      updatedDoc = { ...updatedDoc, ...update.$set };
    }
    if (!update.$push && !update.$set) {
      updatedDoc = { ...updatedDoc, ...update };
    }

    items[idx] = updatedDoc;
    await this.write(items);
    return this.wrap(updatedDoc);
  }

  async deleteMany(query = {}) {
    const items = await this.read();
    const remaining = items.filter(item => {
      for (const key in query) {
        if (item[key] === query[key]) {
          return false;
        }
      }
      return true;
    });
    await this.write(remaining);
    return { deletedCount: items.length - remaining.length };
  }
}

export const UserJson = new JsonModel('users.json');
export const CinemaJson = new JsonModel('cinemas.json');
export const MovieJson = new JsonModel('movies.json');
export const ShowJson = new JsonModel('shows.json');
export const BookingJson = new JsonModel('bookings.json');
