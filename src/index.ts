declare let window: any
import '../style/index.scss'
import ResultViewer from './ResultViewer'
import HeaderViewer from './HeaderViewer'
import { fetch_imagedata, query, queryAll, fetch_npy_zip } from './utils'
import { RunData, DrawCMD } from './datatypes'
import { fetch_rundata, viewer_update_loop } from './viewer_utils'
import { DrawController } from './draw_controller'
import './scroll_sections'
import init_varytest  from './varytest'
import smoothscroll from 'smoothscroll-polyfill'
import inlineSVG from './lib/inlineSVG.js'
import ndarray from 'ndarray'
import JsZip from 'jszip'


async function load_viewers(): Promise<ResultViewer[]> {
    const viewers = []
    const draw_controller = new DrawController()
    await draw_controller.initialize()
    
    // Load the single-viewer for the header.
    // const rundata = await fetch_all_data('general_fif_centers', 5)
    const rundata = await fetch_all_data('general_fif_centers', 5)
    viewers.push(
        new SingleResultViewer(
            draw_controller.createViewerDrawCmd(rundata, .5),
            document.querySelector('#header'),
            rundata
        )
    )
    document.querySelectorAll('.viewer').forEach(async (row: HTMLElement) => {
        let { datapath, background, stage } = row.dataset
        const sticky = row.classList.contains('sticky')
        const rundata = await fetch_all_data(datapath, +stage)
        // let mix = parseFloat(row.dataset.mix) || 0.7
        // const background_img = backgrounds[background || 'WI']
        const draw_cmd = draw_controller.createViewerDrawCmd(rundata, .5)
        viewers.push(new ResultViewer(draw_cmd, row, rundata))
    })
    return viewers

window.BigUint64Array = null

inlineSVG.init({
    svgSelector: '.inline', // the class attached to all images that should be inlined
    // initClass: 'js-inlinesvg', // class added to <html>
});

async function main() {
    
    console.time('main')
    const viewers = []
    // await fetch_rundata('general_fif_centers', 5)
    // await fetch_npy_zip('/data/general_fif_centers/state_5.npy.zip')
    // await fetch_imagedata('/data/general_fif_centers/state_5.png')
    // await fetch_npy_zip('/data/general_fif_centers/state_5.npy.zip')
    // console.log(data);
    
    // Create the drawing interface.
    const color_scale_img = '/imgs/scale_rdbu_1px.png'
    const draw_controller = new DrawController(color_scale_img)
    await draw_controller.initialize()

    // Load the header viewer.
    const rundata = await fetch_rundata('general_fif_centers', 5)
    const draw_cmd = draw_controller.createViewerDrawCmd(rundata, .5)
    viewers.push(new HeaderViewer(draw_cmd, query('#header'), rundata))
    
    // Start the draw loop before loading other viewers.
    viewer_update_loop(viewers)

    for (const row of queryAll('.viewer_row')) {
        let { datapath, stage } = row.dataset
        const rundata = await fetch_rundata(datapath, +stage)
        const draw_cmd = draw_controller.createViewerDrawCmd(rundata, .5)
        const viewer = new ResultViewer(draw_cmd, row, rundata, true, ['rep advantage'])
        if (row.id == 'varytest') {
            init_varytest(viewer, draw_controller)
        }
        viewers.push(viewer)
    }
    console.timeEnd('main')
}

    

main()