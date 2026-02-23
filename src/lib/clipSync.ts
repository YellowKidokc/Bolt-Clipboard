import { api } from './api';
import type { Clip, Note, Bookmark } from '../types';

export async function getClips(search?: string, tagFilter?: string): Promise<Clip[]> {
  const clips = await api.clips.list();
  return clips;
}

export async function createClip(clip: Partial<Clip>, tagIds?: string[]): Promise<Clip> {
  return await api.clips.create({
    title: clip.title,
    content: clip.content!,
    source: clip.source,
  });
}

export async function updateClip(id: string, updates: Partial<Clip>): Promise<void> {
  await api.clips.update(id, {
    title: updates.title,
    content: updates.content!,
  });
}

export async function deleteClip(id: string): Promise<void> {
  await api.clips.delete(id);
}

export async function getNotes(search?: string): Promise<Note[]> {
  const notes = await api.notes.list();
  return notes;
}

export async function createNote(note: Partial<Note>, tagIds?: string[]): Promise<Note> {
  return await api.notes.create({
    title: note.title,
    content: note.content!,
    source: note.source,
  });
}

export async function updateNote(id: string, updates: Partial<Note>): Promise<void> {
  await api.notes.update(id, {
    title: updates.title,
    content: updates.content!,
  });
}

export async function deleteNote(id: string): Promise<void> {
  await api.notes.delete(id);
}

export async function getBookmarks(search?: string): Promise<Bookmark[]> {
  const bookmarks = await api.bookmarks.list();
  return bookmarks;
}

export async function createBookmark(bookmark: Partial<Bookmark>, tagIds?: string[]): Promise<Bookmark> {
  return await api.bookmarks.create({
    url: bookmark.url!,
    title: bookmark.title,
    description: bookmark.description,
  });
}

export async function deleteBookmark(id: string): Promise<void> {
  await api.bookmarks.delete(id);
}

export async function getTags(): Promise<any[]> {
  return [];
}

export async function createTag(name: string): Promise<any> {
  return { id: crypto.randomUUID(), name };
}

export async function getPrompts(category?: string, search?: string): Promise<any[]> {
  return [];
}

export async function createPrompt(prompt: any, tagIds?: string[]): Promise<any> {
  return { id: crypto.randomUUID(), ...prompt };
}

export async function updatePrompt(id: string, updates: any): Promise<void> {
  return;
}

export async function deletePrompt(id: string): Promise<void> {
  return;
}

export async function getLinks(pageId: string, search?: string): Promise<any[]> {
  return [];
}

export async function createLink(link: any, tagIds?: string[]): Promise<any> {
  return { id: crypto.randomUUID(), ...link };
}

export async function updateLink(id: string, updates: any): Promise<void> {
  return;
}

export async function deleteLink(id: string): Promise<void> {
  return;
}

export async function getCustomPages(): Promise<any[]> {
  return [];
}

export async function createCustomPage(page: any): Promise<any> {
  return { id: crypto.randomUUID(), ...page };
}

export async function updateCustomPage(id: string, updates: any): Promise<void> {
  return;
}

export async function deleteCustomPage(id: string): Promise<void> {
  return;
}

export async function getSetting(key: string): Promise<string | null> {
  return null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  return;
}

export async function updateItemTags(
  itemId: string,
  tagIds: string[],
  itemType: 'clip' | 'note' | 'bookmark' | 'prompt' | 'link'
): Promise<void> {
  return;
}

export interface Hotkey {
  id: string;
  user_id: string;
  combo: string;
  action: string;
  target?: string;
  label: string;
  payload?: string;
  created_at: string;
}

export async function getHotkeys(): Promise<Hotkey[]> {
  return [];
}

export async function createHotkey(hotkey: Partial<Hotkey>): Promise<Hotkey> {
  return { id: crypto.randomUUID(), ...hotkey } as Hotkey;
}

export async function updateHotkey(id: string, updates: Partial<Hotkey>): Promise<void> {
  return;
}

export async function deleteHotkey(id: string): Promise<void> {
  return;
}
