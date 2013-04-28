#!/usr/bin/env python
# -*- coding: utf-8 -*-

import json
import os
import urllib2


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

sitemap		= open('sitemap.xml', 'w')
sitemap.write(u'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
sitemap.write(u'<url><loc>' + url + u'</loc><priority>1.0</priority></url>')


for section in sections:
	f		= open(prefix + section, 'w')
	f.write(snapshot.replace(u'"TITLE" by ARTIST', section[0].upper() + section[1:]).encode(codec))
	f.close()
	
	sitemap.write(u'<url><loc>' + url + hashbang + section + u'</loc><priority>0.8</priority></url>')


os.makedirs(prefix + home)

for k in lastPlayed:
	track	= tracks[k]
	path	= home + u'/' + k
	f		= open(prefix + path, 'w')
	f.write(snapshot.replace(u'TITLE', track['title']).replace(u'ARTIST', track['artist']).encode(codec))
	f.close()

	sitemap.write(u'<url><loc>' + url + hashbang + path + u'</loc><priority>0.5</priority></url>')


sitemap.write(u'</urlset>')
sitemap.close()
