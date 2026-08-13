import { getCollection, type CollectionEntry } from 'astro:content';

export async function getPublishedPosts(): Promise<CollectionEntry<'blog'>[]> {
  const posts = await getCollection('blog', ({ data }) => data.draft !== true);
  return posts.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
}

export async function getProjects(): Promise<CollectionEntry<'projects'>[]> {
  const projects = await getCollection('projects');
  return projects.sort((a, b) => {
    if (a.data.order !== b.data.order) return a.data.order - b.data.order;
    return a.data.title.localeCompare(b.data.title);
  });
}

export async function getProjectById(
  id: string,
): Promise<CollectionEntry<'projects'> | undefined> {
  const projects = await getCollection('projects');
  return projects.find((project) => project.id === id);
}

export async function getPublishedPostById(
  id: string,
): Promise<CollectionEntry<'blog'> | undefined> {
  const posts = await getCollection('blog', ({ data }) => data.draft !== true);
  return posts.find((post) => post.id === id);
}
