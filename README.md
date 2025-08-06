# Cookie Auto Crumbler

## Setup
1. `git clone`
2. `npm install` (in the local program folder)
3. `npx webpack` (in the local program folder)

## Structure
- `/src` - the source files of the extension
- `webpack.config.js` - configuring the build

Questions, mistakes, suggestions: oneerrorx@gmail.com

## Remarks
- Some data cannot be deleted due to a limitation of the chrome api. For example, user permissions for websites (such as blocking or allowing notifications) can only be cleared manually.
- When the tab is closed (if there are no duplicate tabs open), the cache is cleared, so it may take a little more traffic to load the cache again.
- Some sites may overwrite part of the cache and cookies even after clearing, so for maximum and complete cleaning, sometimes you have to clear twice. In any case, more than 90% of the information is deleted automatically, leaving mostly service elements.
- The program is in beta testing, so there will be improvements in functionality and features in the future. The full source code here.

## Установка
1. `git clone`
2. `npm install` (в локальной папке программы)
3. `npx webpack` (в локальной папке программы)

## Структура
- `/src` - исходные файлы расширения
- `webpack.config.js` - настройка сборки

## Замечания
- Некоторые данные не могут быть удалены из-за ограничения api chrome. Например пользовательские разрешения для сайтов (например блокировка или разрешение показа уведомлений), их можно очистить только вручную.
- Во время закрытия вкладки (при отсутствии открытых вкладок-дубликатов сайта) очищается кэш, поэтому, возможно, будет немного больше расходовать трафика для загрузки кэша повторно.
- Некоторые сайты могут перезаписывать часть кэша и куки даже после очистки, поэтому для максимальной и полной очистки иногда приходится очищать два раза. В любом случае, более 90% информации удаляется автоматически. Остаются, в основном, служебные элементы. 
- Программа в бета тестировании, поэтому в будущем будет улучшение функционала и возможностей. Полный исходный код приложения тут.
Вопросы, ошибки, предложения: oneerrorx@gmail.com
