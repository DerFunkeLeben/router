# ROUTER

## Как работаем с роутером?

Пишем сценарий в pres_config: ветки- массивы строк, ребра - объект с уникальными значениями.
Основная ветка default. Остальным веткам можно давать любое название, но часто ветки надо называть по названию препарата.
Ребро - объект, где ключи это название слайда. У ребра есть два метода - **next** и **prev**. Методы возвращают так же объект с ключами **scene** и **slide**.

А что если на слайде много кнопок и каждая ведет на разные слайды? Для этого в слайде на каждую кнопку вешается атрибут **data-store**. Значение либо числовое, либо строковое - как тебе удобнее. По клику на кнопку роутер записывает в sessionStorage полученное значение атрибута и на его основании берет из ребра нужный следующий слайд.


## Главный роутер
Создает объект с информацией о презентации и текущем слайде. К этой информации можно всегда обратиться:

allPres: {nexium_pediatria_2021_1: {…}} // pres_config собранных презентаций  
currPres: "nexium_pediatria_2021_1"  
currScen: "" // текущая ветка. информация записывается в sessionStorage  
currSlide: "nex_0121_p1" // текущий слайд.   
isChrome: true  
mainScen: "" информация записывается в sessionStorage  
mainSlide: "" информация записывается в sessionStorage  
routerFlags: [] // флаги, указывающие на поведение роутера. 'SAVE_STORE' / 'SWIPE_RIGHT_WORK_WITH_SCEN_NO_HISTORY' - говорит: ходи назад только по сценарию, а не по истории / 'DONT_USE_PRES_ID' // записываются в configuration.js  
swipeOn: true  


Чтобы получить информацию выше, нужно обратиться к приватным полям роутера (ай-ай-ай), например window.router__currScen, window.router__flagList. Но к текущий слайд и текущая презентация хранятся в CURRENT_SLIDE и CURRENT_PRESENTATION

История передвижений по презентации записывается в session storage.


### Якоря, или anchors
Когда мы хотим запомнить слайд, с которого перешли на другую ветку и вернуться на него с любого слайда дополнительной ветки, к нам на помощь приходят якоря.

В момент перехода кинь якорь на слайд: window.router.pushAnchor()
Когда захочешь вернуться, просто вызови window.router.goToAnchor(), он возьмет последний записанный якорь и отправит тебя туда.
Если нужно очистить список якорей - window.router.clearAnchors()

**Veeva Router** 
