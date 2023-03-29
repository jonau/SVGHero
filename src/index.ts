import { SVGHero } from "./svg-hero";

const slides: HTMLElement[]=[]

for (const slide of document.querySelectorAll(".slide") as NodeListOf<HTMLElement>){
    if (slides.length>0){
        slide.style.visibility="hidden";
    }
    slides.push(slide);
}

function findTransitionHeroElements(from: HTMLElement, to: HTMLElement){
    function findSVGs(element: HTMLElement){
        const svgs: SVGSVGElement[]=[];
        for (const svg of element.querySelectorAll("svg")){
            if (svg.id){
                svgs.push(svg);
            }
        }
        for (const obj of element.querySelectorAll("object")){
            const potentialSVG=obj.getSVGDocument()?.firstElementChild;
            if (potentialSVG && potentialSVG.tagName=="svg"){
                svgs.push(potentialSVG as SVGSVGElement);
            }
        }
        return svgs;
    }

    const from_potentialHeros=findSVGs(from).flatMap(svg=>Array.from(svg.querySelectorAll("[id]")));
    const to_potentialHeros=findSVGs(to).flatMap(svg=>Array.from(svg.querySelectorAll("[id]")));

    const from_potentialHerosIds=from_potentialHeros.map(e=>e.id);
    const to_potentialHerosIds=to_potentialHeros.map(e=>e.id);
    const intersectingIds=from_potentialHerosIds.filter(id=>to_potentialHerosIds.includes(id));

    return intersectingIds.map(id=>({from: from_potentialHeros.find(e=>e.id==id), to: to_potentialHeros.find(e=>e.id==id)}));
}


function animateTransition(from: number, to: number, duration: number=500){
    const from_slide=slides[from];
    const to_slide=slides[to];
    from_slide.style.visibility="visible";
    from_slide.style.opacity="1";
    from_slide.style.zIndex="0";
    to_slide.style.visibility="visible";
    to_slide.style.opacity="0";
    to_slide.style.zIndex="1";
    
    const heros=findTransitionHeroElements(from_slide, to_slide);
    const svgHeros=heros.map(({from, to})=>new SVGHero(from as any, to as any));
    const now=performance.now();
    function animationFrame(t: number){
        const dt=t-now;
        const progress=dt/duration;
        to_slide.style.opacity=progress.toString();
        svgHeros.forEach(hero=>hero.setProgress(progress));
        if (progress<1){
            requestAnimationFrame(animationFrame);
        }else{
            from_slide.style.visibility="invisible";
            from_slide.style.opacity="1";
            to_slide.style.visibility="visible";
            to_slide.style.opacity="1";
            svgHeros.forEach(hero=>hero.remove());
        }
    }
    requestAnimationFrame(animationFrame);
}


function test(){
    setTimeout(()=>animateTransition(0, 1, 5000),500);
    setTimeout(()=>animateTransition(1, 0, 5000),6000);
}

window.onload=test;
