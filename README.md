# AI Engineering — Edición esencial en español

Sitio estático (sin build, sin dependencias) para estudiar lo esencial de la ingeniería de IA.
Basado en *AI Engineering: Building Applications with Foundation Models*, de Chip Huyen.

## Qué incluye

- **50 lecciones** organizadas en **10 módulos** (4 lecciones y 1 evaluación por módulo).
- Lectura continua: botón «Completar y seguir», navegación con ← y →, temario lateral siempre disponible.
- **10 evaluaciones** de 3 preguntas con explicaciones y **30 ejercicios** aplicados.
- Progreso guardado en `localStorage`, glosario con buscador y modo claro/oscuro.
- Buscador global con atajo `⌘K` / `Ctrl+K`.
- **38 figuras** del libro con su pie original.
- Manual esencial en PDF: `AI-Engineering-Esencial.pdf`.
- Tipografías locales (Fraunces + Inter), sin depender de Google Fonts.

## Estructura

```
index.html                 Portada y temario completo
e1l1.html … e10q.html      50 lecciones y evaluaciones
glosario.html              Glosario con búsqueda
progreso.html              Progreso por módulo
css/curso.css              Diseño editorial responsive
js/curso.js                Navegación, progreso, búsqueda y quizzes
assets/figuras/            Figuras del libro
assets/fonts/              Tipografías locales
AI-Engineering-Esencial.pdf
```

## Publicar en GitHub Pages

```bash
cd ai-engineering-esencial
git init
git add .
git commit -m "Curso AI Engineering en español"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/ai-engineering-esencial.git
git push -u origin main
```

Después: **Settings → Pages → Deploy from a branch → main → / (root)**.

## Regenerar

```bash
python build_site.py          # solo el sitio
python build_site.py --pdf    # sitio + manual esencial en PDF
```

El PDF se compone con WeasyPrint a partir del mismo contenido. Si solo cambias el diseño del sitio, no hace falta regenerarlo.

## Atajos

| Tecla | Acción |
|---|---|
| `←` / `→` | Lección anterior / siguiente |
| `C` | Marcar la lección actual como completada |
| `/` o `⌘K` | Abrir el buscador |
| `Esc` | Cerrar buscador o menú |
| `?` | Recordatorio de atajos |

## Créditos

Edición esencial basada en el curso completo y en el libro *AI Engineering* de Chip Huyen. Uso educativo.
