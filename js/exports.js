goog.provide('exports');
/** @preserve EXPORT START */
goog.require('require');
goog.require('authentication');
goog.require('closurequery');
goog.require('controllers');
goog.require('datastore');
goog.require('debug');
goog.require('require');
goog.require('services');
goog.require('stream');
goog.require('ui');
window["exports"] = {
"authentication.username": authentication.username,
"datastore.data.user.current.nowPlayingProcessed.title": datastore.data.user.current.nowPlayingProcessed.title,
"datastore.data.user.current.nowPlayingProcessed.artist": datastore.data.user.current.nowPlayingProcessed.artist,
"datastore.data.user.current.nowPlayingProcessed.length": datastore.data.user.current.nowPlayingProcessed.length,
"datastore.data.user.current.isOnline": datastore.data.user.current.isOnline,
"datastore.data.user.current.library.processed": datastore.data.user.current.library.processed,
"stream.play": stream.play,
"stream.isPlaying": stream.isPlaying,
"stream.newTimeProcessed": stream.newTimeProcessed,
"stream.loadTrack": stream.loadTrack,
"ui.playButtonClass": ui.playButtonClass,
"ui.slider.onclick": ui.slider.onclick,
"ui.pageLoadingClass": ui.pageLoadingClass,
"ui.pageLoadingClass": ui.pageLoadingClass,
"END": "END" };
/** @preserve EXPORT END */
