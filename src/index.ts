import { SVGHero } from "./svg-hero";

let currentSlide=0;
const slides: HTMLElement[]=[]

const keyListener=(e: any)=>{
    if (e.key=="ArrowRight" || e.key=="ArrowDown" || e.key=="PageDown"){
        const nextSlide=Math.min(currentSlide+1, slides.length-1)
        if (nextSlide!=currentSlide) animateTransition(currentSlide, nextSlide);
        currentSlide=nextSlide;
        e.preventDefault();
    }else if (e.key=="ArrowLeft" || e.key=="ArrowUp" || e.key=="PageUp"){
        const nextSlide=Math.max(currentSlide-1, 0)
        if (nextSlide!=currentSlide) animateTransition(currentSlide, nextSlide);
        currentSlide=nextSlide;
        e.preventDefault();
    }
    if(e.key=="F5"){
        e.preventDefault();
    }
}


function findTransitionHeroElements(from: HTMLElement, to: HTMLElement){
    function findSVGs(element: HTMLElement){
        const svgs: SVGSVGElement[]=[];
        for (const svg of element.querySelectorAll("svg")){
            svgs.push(svg);
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
    if (heros.length==0){
        from_slide.style.visibility="hidden";
        from_slide.style.opacity="1";
        to_slide.style.visibility="visible";
        to_slide.style.opacity="1";
        return;
    }
    const svgHeros=heros.map(({from, to})=>new SVGHero(from as any, to as any, duration));
    setTimeout(()=>
    {
        from_slide.style.visibility="hidden";
        from_slide.style.opacity="1";
        to_slide.style.visibility="visible";
        to_slide.style.opacity="1";
    }
    , from<to?duration*3/4:duration*1/4);
}


for (const slide of Array.from(document.querySelector(".slide_set")?.children!) as HTMLElement[]){
    if (slide.classList.contains("slide")){
        if (slides.length>0){
            slide.style.visibility="hidden";
        }
        slides.push(slide);
    }
}

window.addEventListener("keydown", keyListener);

