#!/usr/bin/env python
# -*- coding: utf-8 -*-

import urllib
import urllib2
import json


codec		= 'utf8'
url			= u'http://peer.fm/'
prefix		= u'?_escaped_fragment_='
hashbang	= u'#!'
sections	= [u'chat', u'library', u'search', u'hotlist', u'transfer', u'discovery', u'about']
home		= u'home'
lastPlayed	= list(set(json.loads(urllib2.urlopen('https://napsterfm.firebaseio.com/lastPlayed.json').read()).values()))[0:49900]
tracks		= json.loads(urllib2.urlopen('https://napsterfm.firebaseio.com/track.json').read())

f			= open('snapshot.html', 'r')
snapshot	= f.read().decode(codec)
f.close()

genericSnapshot	= snapshot.replace(u'TITLE', u'Genocidée').replace(u'ARTIST', u'Zed Sin').encode(codec)

sitemap		= open('sitemap.xml', 'w')
sitemap.write(u'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
sitemap.write(u'<url><loc>' + url + u'</loc><priority>1.0</priority></url>')


for section in sections:
	f		= open(urllib.quote_plus(prefix + section), 'w')
	f.write(genericSnapshot)
	f.close()
	
	sitemap.write(u'<url><loc>' + url + hashbang + section + u'</loc><priority>0.8</priority></url>')


for k in lastPlayed:
	track	= tracks[k]
	path	= home + u'/' + k
	f		= open(urllib.quote_plus(prefix + path), 'w')
	f.write(snapshot.replace(u'TITLE', track['title']).replace(u'ARTIST', track['artist']).encode(codec))
	f.close()

	sitemap.write(u'<url><loc>' + url + hashbang + path + u'</loc><priority>0.5</priority></url>')


sitemap.write(u'</urlset>')
sitemap.close()
