const chalk = require('chalk');
const express = require('express');
const handlebars = require('handlebars');
const puppeteer = require('puppeteer');
const printer = require('node-printer');
const path = require('path');
const fs = require('fs');

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
        }));
    }
    catch {
        console.log(chalk.red('X'), chalk.red('Ошибка чтения файла шаблона.'));
    }
});

const server = app.listen(8080, async () => {
    console.log(chalk.green('Сервер запузщен на хосте localhost:8080'));

    const browser = await puppeteer.launch({
        args: [
            '--no-sandbox',
        ],
        headless: true,
    });
    
    const page = await browser.newPage();

    await page.goto(`http://localhost:8080`, {
        waitUntil: "networkidle0",
    });

    await page.pdf({
        format: "A4",
        // margin: {
        //     top: "40px",
        //     bottom: "100px",
        // },
        // printBackground: true,
        path: "default.pdf",
    });
    
    await browser.close();
    await server.close();
});
