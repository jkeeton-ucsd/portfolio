console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

let pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'cv/', title: 'CV' },
  { url: 'contact/', title: 'Contact' },
  { url: "https://github.com/jkeeton-ucsd", title: 'GitHub' },
];

const BASE_PATH =
  location.hostname === 'localhost' || location.hostname === '127.0.0.1'
    ? '/' // Local server
    : '/portfolio/'; // GitHub Pages repo name

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
  let url = p.url;
  let title = p.title;

  if (!url.startsWith('http')) {
    url = BASE_PATH + url;
  }

  let a = document.createElement('a');
  a.href = url;
  a.textContent = title;
  nav.append(a);

  if (a.host === location.host && a.pathname === location.pathname) {
    a.classList.add('current');
  }

  if (a.host !== location.host) {
    a.target = '_blank';
  }
}

document.body.insertAdjacentHTML(
  'afterbegin',
  `
  <label class="color-scheme">
    Theme:
    <select>
      <option value="light dark">Automatic</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  </label>`,
);

let select = document.querySelector('.color-scheme select');

function setColorScheme(colorScheme) {
  document.documentElement.style.setProperty('color-scheme', colorScheme);
  select.value = colorScheme;
}

if ('colorScheme' in localStorage) {
  setColorScheme(localStorage.colorScheme);
}

select.addEventListener('input', function (event) {
  setColorScheme(event.target.value);
  localStorage.colorScheme = event.target.value;
});

let form = document.querySelector('form');

form?.addEventListener('submit', function (event) {
  event.preventDefault();

  let data = new FormData(form);
  let params = [];

  for (let [name, value] of data) {
    params.push(`${name}=${encodeURIComponent(value)}`);
  }

  let url = form.action + '?' + params.join('&');
  location.href = url;
});

export async function fetchJSON(url) {
  try {
    // Fetch the JSON file from the given URL
    const response = await fetch(url);
    console.log(response);
 
    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }
 
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching or parsing JSON data:', error);
  }
}

export async function fetchGitHubData(username) {
  return fetchJSON(`https://api.github.com/users/${username}`);
}

function resolvePath(path) {
  if (!path || /^(https?:)?\/\//.test(path) || path.startsWith('/')) return path;
  return BASE_PATH + path;
}

export function renderProjects(projects, containerElement, headingLevel = 'h2') {
  // Bail out if there's nowhere to render
  if (!(containerElement instanceof Element)) {
    console.error('renderProjects: containerElement is not a valid DOM element');
    return;
  }
 
  // Only allow real heading tags (h1–h6); fall back to h2 otherwise
  if (!/^h[1-6]$/i.test(headingLevel)) {
    console.warn(`renderProjects: "${headingLevel}" is not a heading tag, using h2`);
    headingLevel = 'h2';
  }
 
  // Clear the container so re-renders don't duplicate projects
  containerElement.innerHTML = '';
 
  // Placeholder when there's nothing to show (or the fetch failed)
  if (!Array.isArray(projects) || projects.length === 0) {
    containerElement.innerHTML = '<p>No projects to show yet.</p>';
    return;
  }
 
  for (let project of projects) {
    const article = document.createElement('article');
 
    const title = project.title ?? 'Untitled project';
    const image = resolvePath(project.image ?? 'https://vis-society.github.io/labs/2/images/empty.svg');
    const description = project.description ?? '';
 
    const content = `
      <${headingLevel}>${title}</${headingLevel}>
      <img src="${image}" alt="${title}">
      <p>${description}</p>
    `;
 
    // Optional: if a project has a url, make the whole card a link
    article.innerHTML = project.url
      ? `<a href="${resolvePath(project.url)}" class="project-link">${content}</a>`
      : content;
 
    containerElement.appendChild(article);
  }
}

