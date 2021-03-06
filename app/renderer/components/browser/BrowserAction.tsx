const { ipcRenderer } = chrome

import React, { Component } from 'react'
import cx from 'classnames'

import styles from './BrowserAction.css'
import { IExtension, getBrowserActionBackgroundImage } from '../../reducers/extensions'

interface IProps {
  tabId: number
  extension: IExtension
  popupOpen: boolean
  closePopup: Function
}

interface IState {}

export class BrowserAction extends Component<IProps, IState> {
  state: IState = {}

  render(): JSX.Element {
    const { extension } = this.props
    const img = getBrowserActionBackgroundImage(extension)

    const btnStyle = {
      backgroundImage: img
    }

    return (
      <div className={styles.action}>
        <button
          type="button"
          className={styles.actionBtn}
          style={btnStyle}
          onClick={this.onClick}
          title={extension.name}
        />
      </div>
    )
  }

  private onClick = (e: React.MouseEvent<any>) => {
    e.nativeEvent.stopImmediatePropagation()

    if (this.props.popupOpen) {
      this.props.closePopup()
      return
    }

    const target = e.target as HTMLElement
    if (!target) return

    let centerX
    let centerY
    if (!e.nativeEvent.x || !e.nativeEvent.y) {
      // Handles case where user focuses button, and presses Enter
      let { top: offsetTop, left: offsetLeft } = target.getBoundingClientRect()
      centerX = offsetLeft + target.offsetWidth * 0.5
      centerY = offsetTop + target.offsetHeight * 0.5
    }
    let props = {
      x: e.nativeEvent.x || centerX,
      y: e.nativeEvent.y || centerY,
      screenX: e.nativeEvent.screenX,
      screenY: e.nativeEvent.screenY,
      offsetX: e.nativeEvent.offsetX,
      offsetY: e.nativeEvent.offsetY
    }

    // HACK: have to manually pass in 'tabId' search param to PopupWindow component
    const win = window as any
    win.__POPUP_TAB_ID__ = this.props.tabId

    const ext = this.props.extension
    ipcRenderer.send('chrome-browser-action-clicked', ext.id, this.props.tabId, ext.name, props)
  }
}
