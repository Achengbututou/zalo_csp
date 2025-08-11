import React, { useState, useRef } from "react";
import { 
  Box, 
  Input, 
  Button, 
  Text, 
  Radio, 
  Checkbox, 
  Switch, 
  DatePicker, 
  Select, 
  Picker,
  Icon,
  Sheet,
  useSnackbar
} from "zmp-ui";
import { useForm, Controller } from "react-hook-form";

// 富文本编辑器组件
export const RichTextEditor: React.FC<{
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}> = ({ value = "", onChange, placeholder = "请输入内容..." }) => {
  const [currentValue, setCurrentValue] = useState(value);
  const [isFormatting, setIsFormatting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const formatText = (format: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = currentValue.substring(start, end);
    
    let formattedText = selectedText;
    let newCursorPos = end;

    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        newCursorPos = end + 4;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        newCursorPos = end + 2;
        break;
      case 'underline':
        formattedText = `<u>${selectedText}</u>`;
        newCursorPos = end + 7;
        break;
      case 'link':
        formattedText = `[${selectedText || '链接文本'}](http://example.com)`;
        newCursorPos = end + (selectedText ? 21 : 33);
        break;
      case 'code':
        formattedText = `\`${selectedText}\``;
        newCursorPos = end + 2;
        break;
      case 'list':
        formattedText = selectedText.split('\n').map(line => `• ${line}`).join('\n');
        newCursorPos = end + selectedText.split('\n').length * 2;
        break;
    }

    const newValue = currentValue.substring(0, start) + formattedText + currentValue.substring(end);
    setCurrentValue(newValue);
    onChange?.(newValue);

    // 恢复光标位置
    setTimeout(() => {
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  return (
    <Box className="border border-gray-300 rounded-lg overflow-hidden">
      {/* 工具栏 */}
      <Box className="bg-gray-50 p-2 border-b border-gray-200 flex flex-wrap gap-2">
        <Button size="small" type="neutral" onClick={() => formatText('bold')}>
          <Text className="font-bold">B</Text>
        </Button>
        <Button size="small" type="neutral" onClick={() => formatText('italic')}>
          <Text className="italic">I</Text>
        </Button>
        <Button size="small" type="neutral" onClick={() => formatText('underline')}>
          <Text className="underline">U</Text>
        </Button>
        <Button size="small" type="neutral" onClick={() => formatText('link')}>
          🔗
        </Button>
        <Button size="small" type="neutral" onClick={() => formatText('code')}>
          &lt;/&gt;
        </Button>
        <Button size="small" type="neutral" onClick={() => formatText('list')}>
          📋
        </Button>
      </Box>

      {/* 编辑区域 */}
      <textarea
        ref={textareaRef}
        value={currentValue}
        onChange={(e) => {
          setCurrentValue(e.target.value);
          onChange?.(e.target.value);
        }}
        placeholder={placeholder}
        className="w-full p-3 min-h-32 resize-none focus:outline-none"
        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
      />

      {/* 预览区域 */}
      {currentValue && (
        <Box className="bg-blue-50 p-3 border-t border-gray-200">
          <Text size="xSmall" className="text-blue-600 mb-2">预览效果：</Text>
          <Box 
            className="text-sm"
            dangerouslySetInnerHTML={{
              __html: currentValue
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/`(.*?)`/g, '<code style="background:#f0f0f0;padding:2px 4px;border-radius:3px;">$1</code>')
                .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" style="color:#0066cc;">$1</a>')
                .replace(/\n/g, '<br>')
            }}
          />
        </Box>
      )}
    </Box>
  );
};

// 高级时间选择器组件
export const AdvancedTimePicker: React.FC<{
  value?: Date;
  onChange?: (value: Date) => void;
  mode?: 'datetime' | 'date' | 'time';
  showWeek?: boolean;
}> = ({ value, onChange, mode = 'datetime', showWeek = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(value || new Date());

  const formatDateTime = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      ...(mode !== 'date' && {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    };
    return date.toLocaleString('zh-CN', options);
  };

  const getWeekday = (date: Date) => {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return weekdays[date.getDay()];
  };

  return (
    <Box>
      <Button 
        type="neutral" 
        onClick={() => setIsOpen(true)}
        className="w-full justify-start"
      >
        <Box className="flex items-center space-x-2">
          <Icon icon="zi-calendar" />
          <Box>
            <Text>{formatDateTime(selectedDate)}</Text>
            {showWeek && (
              <Text size="xSmall" className="text-gray-500">
                {getWeekday(selectedDate)}
              </Text>
            )}
          </Box>
        </Box>
      </Button>

      <Sheet
        visible={isOpen}
        onClose={() => setIsOpen(false)}
        title="选择时间"
        height="auto"
      >
        <Box className="p-4">
          <DatePicker
            value={selectedDate}
            onChange={(date) => {
              setSelectedDate(date);
              onChange?.(date);
            }}
          />
          
          <Box className="mt-4 space-y-2">
            <Text size="small" className="text-gray-600">快速选择：</Text>
            <Box className="grid grid-cols-2 gap-2">
              <Button 
                size="small" 
                type="neutral"
                onClick={() => {
                  const now = new Date();
                  setSelectedDate(now);
                  onChange?.(now);
                }}
              >
                现在
              </Button>
              <Button 
                size="small" 
                type="neutral"
                onClick={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  setSelectedDate(tomorrow);
                  onChange?.(tomorrow);
                }}
              >
                明天
              </Button>
              <Button 
                size="small" 
                type="neutral"
                onClick={() => {
                  const nextWeek = new Date();
                  nextWeek.setDate(nextWeek.getDate() + 7);
                  setSelectedDate(nextWeek);
                  onChange?.(nextWeek);
                }}
              >
                下周
              </Button>
              <Button 
                size="small" 
                type="neutral"
                onClick={() => {
                  const nextMonth = new Date();
                  nextMonth.setMonth(nextMonth.getMonth() + 1);
                  setSelectedDate(nextMonth);
                  onChange?.(nextMonth);
                }}
              >
                下月
              </Button>
            </Box>
          </Box>

          <Box className="mt-4 flex space-x-2">
            <Button 
              type="highlight" 
              className="flex-1"
              onClick={() => setIsOpen(false)}
            >
              确定
            </Button>
            <Button 
              type="neutral" 
              className="flex-1"
              onClick={() => setIsOpen(false)}
            >
              取消
            </Button>
          </Box>
        </Box>
      </Sheet>
    </Box>
  );
};

// 图标选择器组件
export const IconPicker: React.FC<{
  value?: string;
  onChange?: (value: string) => void;
}> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(value || 'zi-star');

  // ZMP-UI 可用图标列表
  const iconCategories = {
    '基础图标': [
      'zi-home', 'zi-user', 'zi-star', 'zi-heart', 'zi-plus', 'zi-minus',
      'zi-check', 'zi-close', 'zi-arrow-left', 'zi-arrow-right', 'zi-arrow-up', 'zi-arrow-down'
    ],
    '通讯社交': [
      'zi-chat', 'zi-phone', 'zi-mail', 'zi-share', 'zi-like', 'zi-comment'
    ],
    '功能操作': [
      'zi-setting', 'zi-search', 'zi-filter', 'zi-edit', 'zi-delete', 'zi-download',
      'zi-upload', 'zi-refresh', 'zi-copy', 'zi-save'
    ],
    '媒体文件': [
      'zi-camera', 'zi-image', 'zi-video', 'zi-music', 'zi-file', 'zi-folder'
    ],
    '商务购物': [
      'zi-cart', 'zi-shop', 'zi-credit-card', 'zi-wallet', 'zi-gift'
    ],
    '时间地点': [
      'zi-calendar', 'zi-clock', 'zi-location', 'zi-map', 'zi-compass'
    ]
  };

  return (
    <Box>
      <Button 
        type="neutral" 
        onClick={() => setIsOpen(true)}
        className="w-full justify-start"
      >
        <Box className="flex items-center space-x-2">
          <Icon icon={selectedIcon as any} />
          <Text>{selectedIcon}</Text>
        </Box>
      </Button>

      <Sheet
        visible={isOpen}
        onClose={() => setIsOpen(false)}
        title="选择图标"
        height="80%"
      >
        <Box className="p-4">
          {Object.entries(iconCategories).map(([category, icons]) => (
            <Box key={category} className="mb-6">
              <Text className="font-medium mb-3 text-gray-800">{category}</Text>
              <Box className="grid grid-cols-6 gap-3">
                {icons.map((icon) => (
                  <Button
                    key={icon}
                    type={selectedIcon === icon ? "highlight" : "neutral"}
                    size="small"
                    onClick={() => {
                      setSelectedIcon(icon);
                      onChange?.(icon);
                    }}
                    className="aspect-square flex items-center justify-center"
                  >
                    <Icon icon={icon as any} />
                  </Button>
                ))}
              </Box>
            </Box>
          ))}

          <Box className="mt-6 flex space-x-2">
            <Button 
              type="highlight" 
              className="flex-1"
              onClick={() => setIsOpen(false)}
            >
              确定
            </Button>
            <Button 
              type="neutral" 
              className="flex-1"
              onClick={() => setIsOpen(false)}
            >
              取消
            </Button>
          </Box>
        </Box>
      </Sheet>
    </Box>
  );
};

// 颜色选择器组件
export const ColorPicker: React.FC<{
  value?: string;
  onChange?: (value: string) => void;
}> = ({ value = '#3b82f6', onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(value);

  const colorPalette = [
    ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e'],
    ['#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1'],
    ['#8b5cf6', '#a855f7', '#c026d3', '#d946ef', '#ec4899', '#f43f5e'],
    ['#6b7280', '#374151', '#111827', '#fbbf24', '#fb7185', '#34d399']
  ];

  const presetColors = [
    { name: '主色调', color: '#006af5' },
    { name: '成功', color: '#22c55e' },
    { name: '警告', color: '#f59e0b' },
    { name: '危险', color: '#ef4444' },
    { name: '信息', color: '#3b82f6' },
    { name: '灰色', color: '#6b7280' }
  ];

  return (
    <Box>
      <Button 
        type="neutral" 
        onClick={() => setIsOpen(true)}
        className="w-full justify-start"
      >
        <Box className="flex items-center space-x-2">
          <Box 
            className="w-6 h-6 rounded border border-gray-300"
            style={{ backgroundColor: selectedColor }}
          />
          <Text>{selectedColor}</Text>
        </Box>
      </Button>

      <Sheet
        visible={isOpen}
        onClose={() => setIsOpen(false)}
        title="选择颜色"
        height="auto"
      >
        <Box className="p-4">
          {/* 预设颜色 */}
          <Box className="mb-6">
            <Text className="font-medium mb-3 text-gray-800">预设颜色</Text>
            <Box className="grid grid-cols-3 gap-2">
              {presetColors.map(({ name, color }) => (
                <Button
                  key={color}
                  type={selectedColor === color ? "highlight" : "neutral"}
                  size="small"
                  onClick={() => {
                    setSelectedColor(color);
                    onChange?.(color);
                  }}
                  className="flex items-center space-x-2"
                >
                  <Box 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: color }}
                  />
                  <Text size="xSmall">{name}</Text>
                </Button>
              ))}
            </Box>
          </Box>

          {/* 颜色调色板 */}
          <Box className="mb-6">
            <Text className="font-medium mb-3 text-gray-800">颜色调色板</Text>
            <Box className="space-y-2">
              {colorPalette.map((row, rowIndex) => (
                <Box key={rowIndex} className="flex space-x-2">
                  {row.map((color) => (
                    <Button
                      key={color}
                      type="neutral"
                      size="small"
                      onClick={() => {
                        setSelectedColor(color);
                        onChange?.(color);
                      }}
                      className="w-8 h-8 p-0 border-2"
                      style={{ 
                        backgroundColor: color,
                        borderColor: selectedColor === color ? '#000' : 'transparent'
                      }}
                    />
                  ))}
                </Box>
              ))}
            </Box>
          </Box>

          {/* 自定义颜色输入 */}
          <Box className="mb-6">
            <Text className="font-medium mb-3 text-gray-800">自定义颜色</Text>
            <Input
              type="text"
              value={selectedColor}
              onChange={(e) => {
                setSelectedColor(e.target.value);
                onChange?.(e.target.value);
              }}
              placeholder="#000000"
            />
          </Box>

          <Box className="flex space-x-2">
            <Button 
              type="highlight" 
              className="flex-1"
              onClick={() => setIsOpen(false)}
            >
              确定
            </Button>
            <Button 
              type="neutral" 
              className="flex-1"
              onClick={() => setIsOpen(false)}
            >
              取消
            </Button>
          </Box>
        </Box>
      </Sheet>
    </Box>
  );
};

// 高级数字输入组件（使用自定义实现）
export const AdvancedNumberInput: React.FC<{
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  showSlider?: boolean;
}> = ({ 
  value = 0, 
  onChange, 
  min = 0, 
  max = 100, 
  step = 1, 
  prefix, 
  suffix, 
  showSlider = true 
}) => {
  const [currentValue, setCurrentValue] = useState(value);

  const handleChange = (newValue: number) => {
    const clampedValue = Math.min(Math.max(newValue, min), max);
    setCurrentValue(clampedValue);
    onChange?.(clampedValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) || 0;
    handleChange(newValue);
  };

  const increment = () => {
    handleChange(currentValue + step);
  };

  const decrement = () => {
    handleChange(currentValue - step);
  };

  return (
    <Box className="space-y-3">
      {/* 数字输入和手动步进器 */}
      <Box className="flex items-center space-x-2">
        {prefix && <Text className="text-gray-600">{prefix}</Text>}
        
        <Box className="flex items-center border border-gray-300 rounded">
          <Button 
            size="small" 
            type="neutral"
            onClick={decrement}
            disabled={currentValue <= min}
            className="px-2 py-1 border-r border-gray-300"
          >
            -
          </Button>
          
          <input
            type="number"
            value={currentValue}
            onChange={handleInputChange}
            min={min}
            max={max}
            step={step}
            className="w-16 px-2 py-1 text-center border-none outline-none"
          />
          
          <Button 
            size="small" 
            type="neutral"
            onClick={increment}
            disabled={currentValue >= max}
            className="px-2 py-1 border-l border-gray-300"
          >
            +
          </Button>
        </Box>
        
        {suffix && <Text className="text-gray-600">{suffix}</Text>}
      </Box>

      {/* 自定义滑动条 */}
      {showSlider && (
        <Box>
          <Box className="relative">
            <input
              type="range"
              value={currentValue}
              onChange={(e) => handleChange(parseInt(e.target.value))}
              min={min}
              max={max}
              step={step}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((currentValue - min) / (max - min)) * 100}%, #e5e7eb ${((currentValue - min) / (max - min)) * 100}%, #e5e7eb 100%)`
              }}
            />
          </Box>
          <Box className="flex justify-between text-xs text-gray-500 mt-1">
            <Text>{min}</Text>
            <Text>{max}</Text>
          </Box>
        </Box>
      )}

      {/* 快速值选择 */}
      <Box className="flex space-x-2">
        {[min, Math.round((min + max) * 0.25), Math.round((min + max) * 0.5), Math.round((min + max) * 0.75), max].map((quickValue) => (
          <Button
            key={quickValue}
            size="small"
            type={currentValue === quickValue ? "highlight" : "neutral"}
            onClick={() => handleChange(quickValue)}
            className="flex-1"
          >
            {quickValue}
          </Button>
        ))}
      </Box>
    </Box>
  );
};

// 文件上传组件
export const FileUploadComponent: React.FC<{
  value?: File[];
  onChange?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // MB
}> = ({ value = [], onChange, accept = "*/*", multiple = true, maxSize = 5 }) => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>(value);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { openSnackbar } = useSnackbar();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    
    for (const file of files) {
      if (file.size > maxSize * 1024 * 1024) {
        openSnackbar({ text: `文件 ${file.name} 超过 ${maxSize}MB 限制`, type: 'error' });
        continue;
      }
      validFiles.push(file);
    }

    const newFiles = multiple ? [...uploadedFiles, ...validFiles] : validFiles.slice(0, 1);
    setUploadedFiles(newFiles);
    onChange?.(newFiles);
  };

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    onChange?.(newFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box className="space-y-3">
      {/* 上传区域 */}
      <Box 
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        <Icon icon="zi-upload" className="text-gray-400 text-2xl mb-2" />
        <Text className="text-gray-600 mb-1">点击上传文件</Text>
        <Text size="xSmall" className="text-gray-400">
          支持 {accept === "*/*" ? "所有格式" : accept}，最大 {maxSize}MB
        </Text>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />
      </Box>

      {/* 文件列表 */}
      {uploadedFiles.length > 0 && (
        <Box className="space-y-2">
          <Text size="small" className="font-medium text-gray-800">已选择的文件：</Text>
          {uploadedFiles.map((file, index) => (
            <Box key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
              <Box className="flex items-center space-x-2 flex-1">
                <Icon icon="zi-file" className="text-blue-500" />
                <Box className="flex-1 min-w-0">
                  <Text size="small" className="truncate">{file.name}</Text>
                  <Text size="xSmall" className="text-gray-500">{formatFileSize(file.size)}</Text>
                </Box>
              </Box>
              <Button
                size="small"
                type="neutral"
                onClick={() => removeFile(index)}
                className="ml-2"
              >
                <Icon icon="zi-close" />
              </Button>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

// 地址选择器组件
export const AddressPicker: React.FC<{
  value?: { province: string; city: string; district: string; detail: string };
  onChange?: (address: any) => void;
}> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [address, setAddress] = useState(value || { province: '', city: '', district: '', detail: '' });

  // 模拟地址数据
  const addressData = {
    '北京市': {
      '北京市': ['东城区', '西城区', '朝阳区', '丰台区', '石景山区', '海淀区', '门头沟区']
    },
    '上海市': {
      '上海市': ['黄浦区', '徐汇区', '长宁区', '静安区', '普陀区', '虹口区', '杨浦区']
    },
    '广东省': {
      '广州市': ['越秀区', '海珠区', '荔湾区', '天河区', '白云区', '黄埔区'],
      '深圳市': ['罗湖区', '福田区', '南山区', '宝安区', '龙岗区', '盐田区']
    },
    '浙江省': {
      '杭州市': ['上城区', '下城区', '江干区', '拱墅区', '西湖区', '滨江区'],
      '宁波市': ['海曙区', '江北区', '北仑区', '镇海区', '鄞州区']
    }
  };

  const handleAddressChange = (level: string, value: string) => {
    const newAddress = { ...address, [level]: value };
    if (level === 'province') {
      newAddress.city = '';
      newAddress.district = '';
    } else if (level === 'city') {
      newAddress.district = '';
    }
    setAddress(newAddress);
    onChange?.(newAddress);
  };

  const getDisplayText = () => {
    const { province, city, district, detail } = address;
    const parts = [province, city, district, detail].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : '请选择地址';
  };

  return (
    <Box>
      <Button 
        type="neutral" 
        onClick={() => setIsOpen(true)}
        className="w-full justify-start"
      >
        <Box className="flex items-center space-x-2">
          <Icon icon="zi-location" />
          <Text className="truncate">{getDisplayText()}</Text>
        </Box>
      </Button>

      <Sheet
        visible={isOpen}
        onClose={() => setIsOpen(false)}
        title="选择地址"
        height="70%"
      >
        <Box className="p-4 space-y-4">
          {/* 省份选择 */}
          <Box>
            <Text className="mb-2 font-medium">省份</Text>
            <Select
              value={address.province}
              onChange={(value) => handleAddressChange('province', String(value || ''))}
              placeholder="请选择省份"
            >
              {Object.keys(addressData).map(province => (
                <Select.Option key={province} value={province} title={province} />
              ))}
            </Select>
          </Box>

          {/* 城市选择 */}
          {address.province && (
            <Box>
              <Text className="mb-2 font-medium">城市</Text>
                          <Select
              value={address.city}
              onChange={(value) => handleAddressChange('city', String(value || ''))}
              placeholder="请选择城市"
            >
                {Object.keys(addressData[address.province] || {}).map(city => (
                  <Select.Option key={city} value={city} title={city} />
                ))}
              </Select>
            </Box>
          )}

          {/* 区县选择 */}
          {address.city && (
            <Box>
              <Text className="mb-2 font-medium">区县</Text>
                          <Select
              value={address.district}
              onChange={(value) => handleAddressChange('district', String(value || ''))}
              placeholder="请选择区县"
            >
                {(addressData[address.province]?.[address.city] || []).map(district => (
                  <Select.Option key={district} value={district} title={district} />
                ))}
              </Select>
            </Box>
          )}

          {/* 详细地址 */}
          <Box>
            <Text className="mb-2 font-medium">详细地址</Text>
            <Input
              value={address.detail}
              onChange={(e) => handleAddressChange('detail', e.target.value)}
              placeholder="请输入详细地址"
            />
          </Box>

          <Box className="mt-6 flex space-x-2">
            <Button 
              type="highlight" 
              className="flex-1"
              onClick={() => setIsOpen(false)}
            >
              确定
            </Button>
            <Button 
              type="neutral" 
              className="flex-1"
              onClick={() => setIsOpen(false)}
            >
              取消
            </Button>
          </Box>
        </Box>
      </Sheet>
    </Box>
  );
};

// 评分组件
export const RatingComponent: React.FC<{
  value?: number;
  onChange?: (rating: number) => void;
  max?: number;
  allowHalf?: boolean;
}> = ({ value = 0, onChange, max = 5, allowHalf = true }) => {
  const [currentRating, setCurrentRating] = useState(value);
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (rating: number) => {
    setCurrentRating(rating);
    onChange?.(rating);
  };

  const renderStars = () => {
    const stars: React.ReactElement[] = [];
    for (let i = 1; i <= max; i++) {
      const filled = (hoverRating || currentRating) >= i;
      const halfFilled = allowHalf && (hoverRating || currentRating) >= i - 0.5 && (hoverRating || currentRating) < i;
      
      stars.push(
        <Button
          key={i}
          type="neutral"
          size="small"
          className="p-1"
          onClick={() => handleClick(i)}
          onMouseEnter={() => setHoverRating(i)}
          onMouseLeave={() => setHoverRating(0)}
        >
          <Box className="relative">
            <Icon 
              icon="zi-star" 
              className={`text-2xl ${filled ? 'text-yellow-400' : 'text-gray-300'}`}
            />
            {halfFilled && (
              <Icon 
                icon="zi-star" 
                className="absolute top-0 left-0 text-2xl text-yellow-400"
                style={{ clipPath: 'inset(0 50% 0 0)' }}
              />
            )}
          </Box>
        </Button>
      );
    }
    return stars;
  };

  return (
    <Box className="space-y-3">
      <Box className="flex items-center space-x-1">
        {renderStars()}
        <Text className="ml-2 text-gray-600">
          {currentRating > 0 ? `${currentRating}/${max}` : '未评分'}
        </Text>
      </Box>
      
      {currentRating > 0 && (
        <Box className="flex space-x-2">
          <Button
            size="small"
            type="neutral"
            onClick={() => handleClick(0)}
          >
            清除评分
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default {
  RichTextEditor,
  AdvancedTimePicker,
  IconPicker,
  ColorPicker,
  AdvancedNumberInput,
  FileUploadComponent,
  AddressPicker,
  RatingComponent
};
