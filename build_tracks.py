import os, json, subprocess
A=('.mp3','.m4a','.wav','.ogg','.flac'); I=('.jpg','.jpeg','.png','.webp')
os.makedirs('covers',exist_ok=True)
covers={os.path.splitext(f)[0]:f for f in os.listdir('covers') if f.lower().endswith(I)}
same={os.path.splitext(f)[0]:f for f in os.listdir('audio') if f.lower().endswith(I)}
out=[]
for f in sorted(os.listdir('audio')):
    b,e=os.path.splitext(f)
    if e.lower() not in A: continue
    c=None
    if b in covers: c='covers/'+covers[b]
    elif b in same: c='audio/'+same[b]
    else:
        p=f'covers/{b}.jpg'
        r=subprocess.run(['ffmpeg','-v','quiet','-y','-i','audio/'+f,'-an','-map','0:v:0?','-frames:v','1',p])
        if r.returncode==0 and os.path.exists(p) and os.path.getsize(p)>0: c=p
        elif os.path.exists(p): os.remove(p)
    out.append({'file':'audio/'+f,'title':b.replace('_',' '),'cover':c})
json.dump(out,open('tracks.json','w',encoding='utf-8'),ensure_ascii=False,indent=1)
print(len(out),'tracks')
