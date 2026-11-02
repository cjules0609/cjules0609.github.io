#!/usr/bin/env python3
"""Refresh public embed track metadata; no account tokens or audio are stored."""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import json,re,urllib.request
PLAYLISTS=['2M0rQPc8OH1DZGryxinTRr','5ISMTs9lsDMzDRynnmn98G','1tz3CadR4DkYb8poVgRVM8']
def read(playlist):
    request=urllib.request.Request('https://open.spotify.com/embed/playlist/'+playlist,headers={'User-Agent':'Mozilla/5.0'})
    with urllib.request.urlopen(request,timeout=30) as response:html=response.read().decode()
    match=re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>',html)
    if not match:raise ValueError('Spotify metadata unavailable: '+playlist)
    entity=json.loads(match.group(1))['props']['pageProps']['state']['data']['entity']
    tracks=[{'uri':t['uri'],'title':t['title'],'artist':t.get('subtitle',''),'duration':t['duration']} for t in entity['trackList'] if t.get('isPlayable')]
    if not tracks:raise ValueError('No playable tracks: '+playlist)
    return playlist,tracks
if __name__=='__main__':
    data=dict(ThreadPoolExecutor(max_workers=3).map(read,PLAYLISTS))
    path=Path(__file__).resolve().parent/'assets'/'music-tracks.json'
    path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
    print({key:len(tracks) for key,tracks in data.items()})
