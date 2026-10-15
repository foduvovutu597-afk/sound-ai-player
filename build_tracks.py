import os, json, subprocess
A=('.mp3','.m4a','.wav','.ogg','.flac'); I=('.jpg','.jpeg','.png','.webp')
os.makedirs('covers',exist_ok=True)
imgs={}
for root in ('covers','audio'):
    for d,_,fs in os.walk(root):
        for f in fs:
            if f.lower().endswith(I): imgs.setdefault(os.path.splitext(f)[0],os.path.join(d,f))
out=[]
for d,_,fs in sorted(os.walk('audio')):
    for f in sorted(fs):
        b,e=os.path.splitext(f)
        if e.lower() not in A: continue
        rel=os.path.relpath(d,'audio'); genre='' if rel=='.' else rel.split(os.sep)[0]
        c=imgs.get(b)
        if not c:
            p=f'covers/{b}.jpg'
            r=subprocess.run(['ffmpeg','-v','quiet','-y','-i',os.path.join(d,f),'-an','-map','0:v:0?','-frames:v','1',p])
            if r.returncode==0 and os.path.exists(p) and os.path.getsize(p)>0: c=p; imgs[b]=p
            elif os.path.exists(p): os.remove(p)
        out.append({'file':os.path.join(d,f).replace(os.sep,'/'),'title':b.replace('_',' '),'genre':genre,'cover':c})
json.dump(out,open('tracks.json','w',encoding='utf-8'),ensure_ascii=False,indent=1)
print(len(out),'tracks,',sum(1 for t in out if t['cover']),'covers')
