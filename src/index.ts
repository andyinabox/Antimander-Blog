declare let window: any
import '../style/index.scss'
import ResultViewer from './ResultViewer'
import { query, queryAll, fetch_imagedata } from './utils'
import { RunData, DrawCMD } from './datatypes'
import { fetch_rundata, viewer_update_loop, calc_district_stats } from './viewer_utils'
import { DrawController } from './draw_controller'
// import './scroll_sections'
import { X_real, F_real } from './real_data'
import * as array_utils from './array_utils'
import bind_scroll_blocks from './scroll_block_events'
// import * as inlineSVG from './lib/inlineSVG.js'

function add_real_data(rundata:RunData) {
    // Add Wisconsin's real districts to the rundata.
    rundata.X = array_utils.append(rundata.X, X_real)
    const real_f = rundata.config.metrics.map(name => F_real[name])    
    rundata.F = array_utils.append(rundata.F, real_f)
    rundata.district_stats = calc_district_stats(rundata)
}

async function main() {
    console.time('main')
    const viewers = []
    // Create the drawing interface.
    const color_scale = await fetch_imagedata('/imgs/scale_rdbu_1px.png')
    const shadow_img = await fetch_imagedata('/imgs/WI_shadow.png')
    const draw_controller = new DrawController(color_scale, 0.3)

    // Load the first viewer and start draw loop before the others.
    console.time('time_to_first_viewer')
    const viewer_row = query('#overview.viewer_row')
    let { datapath, stage } = viewer_row.dataset    
    const rundata = await fetch_rundata(datapath, +stage)
    add_real_data(rundata)
    rundata.config.metrics = [ "compactness", "competitiveness", "fairness" ]
    const draw_cmd = draw_controller.createViewerDrawCmd(rundata, shadow_img)
    const viewer = new ResultViewer(viewer_row, true, color_scale)
    viewer.setShape(1, 1)
    viewer.setData(draw_cmd, rundata, ['rep advantage'])
    viewers.push(viewer)
    viewer_update_loop(viewers)
    console.timeEnd('time_to_first_viewer')
    bind_scroll_blocks(viewer, draw_controller)
    window.viewer = viewer
    setTimeout(() => viewer.needsDraw(), 1000)
    for (const row of queryAll(`.viewer_row:not(#overview)`)) {
        let { datapath, stage } = row.dataset
        const rundata = await fetch_rundata(datapath, +stage)        
        const draw_cmd = draw_controller.createViewerDrawCmd(rundata, shadow_img)
        const viewer = new ResultViewer(row, true, color_scale)
        viewer.setData(draw_cmd, rundata, ['rep advantage'])
        viewers.push(viewer)
    }

    // inlineSVG.init({
    //     svgSelector: 'img.inline-svg',
    //     // initClass: 'js-inlinesvg', // class added to <html>
    // }, function () {
    // console.log('All SVGs inlined');
    // });

    console.timeEnd('main')
}
main()