import { query, queryAll, range } from './utils'
import { RunData } from './datatypes'
import { X_real, F_real } from './real_data'
import * as array_utils from './array_utils'

type ScrollSection = HTMLElement & {turn_on: Function, turn_off: Function }
type ViewerSlider = HTMLInputElement & {metric_index: number, sorted_idxs: number[] }

function set_real_map(viewer, sliders:ViewerSlider[]) {
    viewer.current = [viewer.rundata.X.shape[0]-1]
    viewer.needs_draw = true
    for (const slider of sliders) {
        const m_idx = slider.metric_index
        slider.value  = (slider.sorted_idxs.indexOf(viewer.current[0]) / viewer.rundata.X.shape[0]).toString()
        // slider.value = viewer.rundata.F.get(viewer.current[0], m_idx)
    }
}


function update_viewer_from_sliders(viewer, slider, sliders) {
    const v = parseFloat(slider.value)
    const draw_idx = slider.sorted_idxs[Math.floor(v * viewer.values.length)]
    viewer.current = [ draw_idx ]
    viewer.needs_draw = true
    sliders.forEach(_slider => {
        const m_idx = _slider.metric_index
        if (slider != _slider) {
            _slider.value  = (_slider.sorted_idxs.indexOf(draw_idx) / viewer.rundata.X.shape[0]).toString()
        }
    })            
}

export default function (viewer) {
    const sliders = queryAll('.slider', viewer.container) as ViewerSlider[]
    // add_real_data(viewer.rundata)
    for (const slider of sliders) {
        const { metric } = slider.dataset
        slider.metric_index = viewer.rundata.config.metrics.indexOf(metric)        
        slider.sorted_idxs = range(viewer.values.length).sort((i, j) => {
            return viewer.values[i][metric] - viewer.values[j][metric]
        })
        slider.oninput = () => {
            update_viewer_from_sliders(viewer, slider, sliders)
        }
    }
    set_real_map(viewer, sliders)
    query('.set_current').onclick = () => set_real_map(viewer, sliders)
    const sp0 = document.getElementById('set-WI') as ScrollSection
    sp0.turn_on  = () => set_real_map(viewer, sliders)
    sp0.turn_off = () => set_real_map(viewer, sliders)

    const pc = query('.parcoords', viewer.container)
    const vc = query('.view_count', viewer.container)
    const sp1 = document.getElementById('show_parcoords_pt1') as ScrollSection
    sp1.turn_on  = () => pc.style.opacity = '1'
    sp1.turn_off = () => pc.style.opacity = '0'
    console.log(vc);
    const sp2 = document.getElementById('show_parcoords_pt2') as ScrollSection
    sp2.turn_on  = () => {
        viewer.setShape(3, 3)
        vc.style.opacity = '1'
    }
    sp2.turn_off = () => {
        viewer.setShape(1, 1)
        vc.style.opacity = '0'
    }

    const scroll_blocks = queryAll('section.snap') as ScrollSection[]
    scroll_blocks.forEach(block => {
        if (!block.classList.contains('focused')) {
            block.classList.add("defocused")
        }
        const highlight_height = (window.innerWidth < 768) ? 0.75 : 0.5
        const { top, height } = block.getBoundingClientRect()
        const y_perc = (top+height/2) / window.innerHeight
        if (y_perc < highlight_height && block.turn_on) {
            block.turn_on()
        }
    })
}