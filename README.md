# Virtual Guitar Studio

Интерактивная виртуальная гитара на Vue 3: электрогитара с эффектами комбика, классическая гитара, метроном, запись лупа, overdub и мобильное управление.

## Запуск локально

```powershell
npm install
npm run dev -- --host 127.0.0.1 --port 5188
```

Открыть: http://127.0.0.1:5188

## Production build

```powershell
npm run build
```

Готовые статические файлы будут в `dist`.

## Хостинг

Проект готов к деплою на GitHub Pages, Vercel или Netlify.

GitHub Pages:

1. Создать репозиторий на GitHub.
2. Запушить проект в ветку `main`.
3. В репозитории открыть `Settings -> Pages`.
4. В `Build and deployment` выбрать `GitHub Actions`.
5. Workflow `.github/workflows/deploy.yml` сам соберет `dist` и опубликует сайт.

Для деплоя не нужен пароль от GitHub в чате. Достаточно ссылки на репозиторий или чтобы локально был выполнен вход через GitHub CLI/браузер.

Vercel:

```powershell
npm i -g vercel
vercel
```

Netlify:

```powershell
npm i -g netlify-cli
netlify deploy --build
```

Для публичного production-деплоя понадобится аккаунт выбранного хостинга.
