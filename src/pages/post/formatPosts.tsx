import { PrismicDocument } from '@prismicio/types';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
/*
    alternate_languages: []
    data:
        author: "Joseph Oliveira"
        banner: {dimensions: {…}, alt: null, copyright: null, url: 'https://images.prismic.io/spacetraveling-gwrodrigu…iando-um-app-cra-do-zero.jpg?auto=compress,format'}
        content: (2) [{…}, {…}]
        subtitle: "Pensando em sincronização em vez de ciclos de vida."
        title: "Como utilizar Hooks"
    first_publication_date: "2022-06-03T21:12:51+0000"
    href: "https://spacetraveling-gwrodrigues.cdn.prismic.io/api/v2/documents/search?ref=YqJt0hEAACIAO8Db&q=%5B%5B%3Ad+%3D+at%28document.id%2C+%22Ypp5GhEAACIAGF8v%22%29+%5D%5D"
    id: "Ypp5GhEAACIAGF8v"
    lang: "pt-br"
    last_publication_date: "2022-06-09T22:01:54+0000"
    linked_documents: []
    slugs: (2) ['como-utilizar-hooks', 'criando-um-app-cra-do-zero']
    tags: []
    type: "posts"
    uid: "como-utilizar-hooks-2"
    url: null
*/ /*
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
} */

interface Post {
  uid: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
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
