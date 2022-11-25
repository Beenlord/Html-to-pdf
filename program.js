const chalk = require('chalk');
const inquirer = require('inquirer');
const express = require('express');
const handlebars = require('handlebars');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

let properties = {};

const app = express();
app.use('/static',express.static(__dirname + '/static'));
app.engine('html', require('ejs').renderFile);

app.get('/', async (req, res) => {
    console.log(chalk.yellow('Выполняется рендер страницы...'));

    try {
        const html = fs.readFileSync(path.join(__dirname, 'views', 'default.html'), 'utf-8');
        const template = handlebars.compile(html);
    
        res.send(template({
            title: 'Штрихкод',
            ...properties,
        }));
    }
    catch {
        console.log(chalk.red('X'), chalk.red('Ошибка чтения файла шаблона.'));
    }
});

inquirer
    .prompt([
        {
            type: 'list',
            name: 'paper',
            message: 'В каком формате печатать?',
            choices: [
                'A4',
                'A5',
                'A6',
            ],
        },
        {
            type: 'number',
            name: 'fields',
            message: 'Поля от краёв листа - ',
            default: 0,
        },
        {
            type: 'number',
            name: 'width',
            message: 'Максимальная ширина картинки в пикселях -',
            default: 512,
        },
        {
            type: 'number',
            name: 'height',
            message: 'Максимальная высота картинки в пикселях - ',
            default: 512,
        },
    ]).then((opt) => {
        const file = process.argv[2] && fs.existsSync(process.argv[2].split(path.sep).pop()) ? process.argv[2] : false;

        if (file) {
            
            properties = {
                ...properties,
                ...opt,
                fileName: path.join('static', file.split(path.sep).pop()),
            };

            console.log('Паратетры запуска:', properties);
    
            const server = app.listen(8080, async () => {
                console.log(chalk.green('Сервер запузщен на хосте localhost:8080'));
            
                const browser = await puppeteer.launch({
                    args: [
                        '--no-sandbox',
                    ],
                    headless: true,
                    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
                });
                
                const page = await browser.newPage();
            
                await page.goto(`http://localhost:8080`, {
                    waitUntil: "networkidle0",
                });
            
                console.log(chalk.yellow('Обработка шаблона...'));
            
                await page.pdf({
                    format: properties.paper,
                    // margin: {
                    //     top: "40px",
                    //     bottom: "100px",
                    // },
                    // printBackground: true,
                    path: "default.pdf",
                });
            
                // console.log(chalk.green('Готово.'));
                
                await browser.close();
                // await server.close();
            });
        } else {
            console.log(chalk.red('X'), 'Путь к файлу изображения указан не верно или более не актуален.');
        }
    });
