// var url = window.location.href
var swUtlLocation = 'js/sw-utils.js'


    // if(url.includes('localhost')){
    //     swUtlLocation = '/js/sw-utils.js'
    // }




importScripts(swUtlLocation)

const STATIC_CACHE = 'static-v5'
const DYNAMIC_CACHE = 'dynamic-v3'
const INMUTABLE_CACHE = 'inmutable-v2'

const APP_SHELL = [
    'index.html',
    'css/style.css',
    'css/animate.css',
    'img/favicon.ico',
    'img/avatars/hulk.jpg',
    'img/avatars/ironman.jpg',
    'img/avatars/spiderman.jpg',
    'img/avatars/thor.jpg',
    'img/avatars/wolverine.jpg',
    'js/app.js',
    'js/sw-utils.js'
]


const APP_SHELL_INMUTABLE =[
    'https://fonts.googleapis.com/css?family=Quicksand:300,400',
    'https://fonts.googleapis.com/css?family=Lato:400,300',
    // 'https://use.fontawesome.com/releases/v5.3.1/css/all.css',
    'css/animate.css',
    'js/libs/jquery.js'
]


function limpiarCache( cacheName, numeroItems ) {
    caches.open( cacheName )
        .then( cache => {
            return cache.keys()
                .then( keys => {
                    
                    if ( keys.length > numeroItems ) {
                        cache.delete( keys[0] )
                            .then( limpiarCache(cacheName, numeroItems) );
                    }
                }); 
        });
}

self.addEventListener('install', e => {
    const cacheStatic = caches.open(STATIC_CACHE).then(cache => cache.addAll(APP_SHELL))

    const cacheInmutable = caches.open(INMUTABLE_CACHE).then(cache => cache.addAll(APP_SHELL_INMUTABLE))

    e.waitUntil(Promise.all([cacheStatic, cacheInmutable]))
})


self.addEventListener('activate', e => {
    const resp = caches.keys().then(keys =>{
        keys.forEach(key => {
            if(key !== STATIC_CACHE && key.includes('static')){
                return caches.delete(key);
            }
            if(key !== DYNAMIC_CACHE && key.includes('dynamic')){
                return caches.delete(key);
            }
        })
    })

    e.waitUntil(resp);
})


self.addEventListener('fetch', e => {
    const respuesta = caches.match( e.request ) .then(res => {
        if (res){
            return res;
        }else {
            return fetch(e.request).then( newRes => {
                return actualizaCacheDinamico(DYNAMIC_CACHE, e.request, newRes)
            })
        }
    })
    e.respondWith(respuesta );
})