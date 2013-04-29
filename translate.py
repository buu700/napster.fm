#!/usr/bin/env python
# -*- coding: utf-8 -*-

import json
import re
import time
from bs4 import BeautifulSoup

# https://github.com/openlabs/Microsoft-Translator-Python-API
# Also, yes, my API key is public
from microsofttranslator import Translator
translator	= Translator('peerfm', 'bJHtNJK4zTLAGtaoyxnO5wI1N3XHN8Fygz2pEn11WTQ=')
def translate(text, language):
	global translator
	for i in range(3):
		try:
			translation	= translator.translate(text, language)
			
			if 'ArgumentException' in translation:
				raise Exception(translation)
			
			return re.sub(u'peer.fm', u'Peer.fm', translation, flags = re.IGNORECASE)
			
		except Exception, e:
			f	= open('translate.log', 'w+')
			f.write(str(e))
			f.close()
			time.sleep(60)
			translator	= Translator('peerfm', 'bJHtNJK4zTLAGtaoyxnO5wI1N3XHN8Fygz2pEn11WTQ=')

def swapStringWithChild(elem, s, child):
	newElem	= BeautifulSoup(unicode(elem).replace(unicode(s), unicode(child))).find_all()[2]
	elem.replace_with(newElem)
	return newElem


codec		= 'utf8'
placeholder	= u'FUCKMAINE'

f			= open('languages.json', 'r')
languages	= json.loads(f.read())
f.close()

f			= open('index.html', 'r')
baseHtml	= f.read()
f.close()


for language in languages:
	try:
		f		= open(language + '.html', 'w')
		html	= BeautifulSoup(baseHtml)
		
		for elem in html.find_all():
			descendants		= elem.find_all()
			
			shouldTranslate	= True
			shouldTranslate	= shouldTranslate and elem.get('notranslate') is None
			shouldTranslate	= shouldTranslate and (not descendants or unicode(elem.parent.get('hash-location')) == u'#about')
			shouldTranslate	= shouldTranslate and (elem.parent is None or elem.parent.parent is None or unicode(elem.parent.parent.get('hash-location')) != u'#about')
			
			if not shouldTranslate:
				continue
			
			
			content		= elem.get('content')
			
			if content is not None and elem.get('name') in ['description', 'keywords', 'author']:
				elem['content']	= translate(unicode(content), language)
			
			
			# Swap out children with placeholders
			for i in range(len(descendants)):
				descendants[i].string	= translate(unicode(descendants[i].string), language)
				descendants[i].replace_with(placeholder + unicode(i))
			
			if descendants:
				elem.string	= elem.text
			
			
			text		= unicode(elem.string)
			
			if elem.string is None or text.strip() == u'':
				continue
			
			bindings	= re.findall('\\{\\{.*?\\}\\}', text)
			
			# Swap out Angular bindings with placeholders
			for i in range(len(bindings)):
				text	= text.replace(bindings[i], placeholder + str(i))
			
			text		= translate(text, language)
			
			# Swap out placeholders with Angular bindings
			for i in range(len(bindings)):
				text	= text.replace(placeholder + str(i), bindings[i])
			
			elem.string	= text
			
			
			# Swap out placeholders with children
			for i in range(len(descendants)):
				elem	= swapStringWithChild(elem, placeholder + unicode(i), descendants[i])
		
		f.write(unicode(html).encode(codec))
		f.close()
	except Exception, e:
		f	= open('translate.log', 'w+')
		f.write(str(e))
		f.close()
