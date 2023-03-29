import { SVG, Matrix, Svg, G, Element as E } from "@svgdotjs/svg.js"


function morphElements(s0: E, s1: E, duration: number=1000){
    const attrs0=s0.attr()
    const attrs1=s1.attr()

    for (const [k, v] of Object.entries(attrs0)){
        if (["x", "y", "transform", "d"].includes(k)){
            if(k in attrs1){
                if (v!=attrs1[k]){
                    if (k=="transform"){
                        const m0=s0.matrix() as any
                        const m1=s1.matrix() as any
                        s0.transform(m0).animate(duration).transform(m1).ease("-");
                        s1.transform(m0).animate(duration).transform(m1).ease("-");
                    }else{
                        s0.attr(k, v).animate(duration).attr(k, attrs1[k]).ease("-");
                        s1.attr(k, v).animate(duration).attr(k, attrs1[k]).ease("-");
                    }
                }
            }
        }
    }

    const c0=s0.children()
    const c1=s1.children()

    if (c0.length==c1.length){
        for (let i=0; i<c0.length; i++){
            morphElements(c0[i], c1[i], duration)
        }
    }
}

function toRoot(element: E){
    let parent=element.parent()
    let attrs=element.attr()
    while(parent){
        attrs={...parent.attr(), ...attrs}
        parent=parent.parent()
        if (parent?.type=="svg"){
            break
        }
    }
    for (const [k, v] of Object.entries(attrs)){
        if (k!="id" && k!="transform"){
            element.attr(k, v)
        }
    }
    element.toRoot()
    return element
}

export class SVGHero{
    constructor(from: SVGElement, to: SVGElement, duration: number=1000){
        const s0 = SVG(from)
        const s1 = SVG(to)

        const s0Hero = toRoot(s0.clone().addTo(s0.parent()!))
        s0Hero.attr("id", null)
        const s1Hero = toRoot(s1.clone().addTo(s1.parent()!))
        s1Hero.attr("id", null)

        s0.attr("visibility", "hidden")
        s1.attr("visibility", "hidden")

        morphElements(s0Hero, s1Hero, duration)

        setTimeout(()=>{
            s0.attr("visibility", null)
            s1.attr("visibility", null)
            s0Hero.remove()
            s1Hero.remove()
        }, duration)

    }
}
