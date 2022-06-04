import { PrismicDocument } from '@prismicio/types';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
    banner?: string;
    content?: string;
  };
}

export function FormatPosts(posts: PrismicDocument[]): Post[] {
  return posts.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date
        ? format(new Date(post.first_publication_date), 'dd MMM yyyy', {
            locale: ptBR,
          })
        : null,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
        banner: post.data.banner,
        content: post.data.content,
      },
    };
  });
}
