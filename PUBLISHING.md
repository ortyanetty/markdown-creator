# Публикация в Visual Studio Marketplace

Пакет подготовлен для издателя **Ortyanetty**. В `package.json` уже указано `"publisher": "Ortyanetty"`.

После загрузки в ваш GitHub-аккаунт в поле **Source code repository** профиля издателя можно указать: https://github.com/ortyanetty/markdown-creator

## Загрузка через сайт

1. Откройте [панель издателя Visual Studio Marketplace](https://marketplace.visualstudio.com/manage) и войдите в аккаунт, которому принадлежит издатель **Ortyanetty**.
2. Выберите издателя **Ortyanetty**.
3. Нажмите **New extension → Visual Studio Code**.
4. Загрузите файл **Ortyanetty.markdown-creator-1.0.2.vsix** и подтвердите загрузку в форме.
5. Дождитесь результата проверки на странице управления расширением. Если сайт покажет ошибку, скопируйте её текст.

Иконка, английское описание и README уже включены в пакет. Если Marketplace сообщит, что имя расширения занято, понадобится выбрать другое имя и пересобрать пакет.

Версия 1.0.2 подготовлена локально. Загрузка в Marketplace ещё не выполнялась.

## Повторная сборка

В папке исходников выполните `npm run package` (нужны Node.js 22 или новее и npm). Упаковщик может назвать новый файл `markdown-creator-1.0.2.vsix`; ID издателя хранится внутри пакета, имя файла на него не влияет.

Иконка: `media/icon.png`, 256×256 пикселей. Редактируемый оригинал: `media/icon.svg`; он исключён из VSIX. Лицензия MIT распространяется и на иконку.

Официальная инструкция: [Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension).
