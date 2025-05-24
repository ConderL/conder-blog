import type { ComponentProps } from '#build/components';
import ConfirmDialog from '~/components/Dialog/ConfirmDialog.vue';

interface ConfirmOptions {
  title?: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'danger';
  confirmLabel?: string;
  cancelLabel?: string;
  showCancel?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export function useConfirm() {
  const overlay = useOverlay();

  /**
   * 打开确认对话框
   */
  const open = async (options: ConfirmOptions) => {
    const confirmDialog = overlay.create(ConfirmDialog);
    
    const result = await confirmDialog.open({
      title: options.title || '确认',
      message: options.message,
      type: options.type || 'info',
      confirmLabel: options.confirmLabel || '确定',
      cancelLabel: options.cancelLabel || '取消',
      showCancel: options.showCancel !== false
    });

    // 处理回调函数
    if (result === true && options.onConfirm) {
      options.onConfirm();
    } else if (result === false && options.onCancel) {
      options.onCancel();
    }

    return result;
  };

  /**
   * 打开信息对话框
   */
  const info = (options: ConfirmOptions) => {
    return open({
      ...options,
      type: 'info'
    });
  };

  /**
   * 打开成功对话框
   */
  const success = (options: ConfirmOptions) => {
    return open({
      ...options,
      type: 'success'
    });
  };

  /**
   * 打开警告对话框
   */
  const warning = (options: ConfirmOptions) => {
    return open({
      ...options,
      type: 'warning'
    });
  };

  /**
   * 打开错误/危险对话框
   */
  const danger = (options: ConfirmOptions) => {
    return open({
      ...options,
      type: 'danger'
    });
  };

  return {
    open,
    info,
    success,
    warning,
    danger
  };
}

// 为了和Nuxt自动导入兼容，导出默认函数
export default useConfirm; 