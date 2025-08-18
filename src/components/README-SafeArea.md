# SafeArea 组件使用指南

## 概述

SafeArea 组件系列用于处理移动设备的安全区域问题，确保内容不被刘海屏、状态栏等遮挡。

## 组件说明

### 1. SafeArea - 基础组件

最基础的安全区域组件，支持全方位的安全区域适配。

```tsx
import { SafeArea } from "components/safe-area";

<SafeArea
  top={true} // 顶部安全区域
  bottom={false} // 底部安全区域
  left={false} // 左侧安全区域
  right={false} // 右侧安全区域
  topOffset={16} // 顶部额外偏移
  className="your-class"
>
  {/* 你的内容 */}
</SafeArea>;
```

### 2. SafeAreaHeader - 头部专用组件

专门用于页面头部的安全区域组件，预设了合适的间距。

```tsx
import { SafeAreaHeader } from "components/safe-area";

<SafeAreaHeader className="bg-primary text-white px-6 shadow-md">
  <Text className="text-white text-lg font-bold text-center">页面标题</Text>
</SafeAreaHeader>;
```

### 3. SafeHeader - 完整头部组件

提供完整头部功能的组件，包括返回按钮、标题等。

```tsx
import { SafeHeader } from "components/with-safe-area";

<SafeHeader
  title="页面标题"
  showBackIcon={true}
  onBackClick={() => navigate(-1)}
  className="additional-styles"
/>;
```

### 4. withSafeArea - 高阶组件

用于包装整个页面组件，提供完整的安全区域支持。

```tsx
import { withSafeArea } from "components/with-safe-area";

const YourPage = () => {
  return <div>{/* 页面内容 */}</div>;
};

export default withSafeArea(YourPage, {
  topOffset: 0,
  pageClassName: "bg-gray-50",
  containerClassName: "min-h-screen",
});
```

## 使用场景

### 场景 1：自定义头部导航栏

```tsx
// 替换前
<Box className="bg-primary text-white px-6 py-4 shadow-md">
  <Text>标题</Text>
</Box>

// 替换后
<SafeAreaHeader className="bg-primary text-white px-6 shadow-md">
  <Text>标题</Text>
</SafeAreaHeader>
```

### 场景 2：登录页面等全屏页面

```tsx
// 替换前
<Page className="min-h-screen bg-white">
  <Box style={{ paddingTop: '100px' }}>
    {/* 内容 */}
  </Box>
</Page>

// 替换后
<Page className="min-h-screen bg-white">
  <SafeArea topOffset={100}>
    {/* 内容 */}
  </SafeArea>
</Page>
```

### 场景 3：使用 zmp-ui Header 的页面

zmp-ui 的 Header 组件已经自动处理安全区域，无需额外处理：

```tsx
// 这些页面无需修改
<Page>
  <Header title="标题" showBackIcon={true} />
  {/* 内容 */}
</Page>
```

### 场景 4：需要完整包装的页面

```tsx
// 使用HOC包装整个页面
const WrappedPage = withSafeArea(YourPageComponent, {
  topOffset: 20,
  pageClassName: "bg-gray-50 min-h-screen",
});
```

## 迁移指南

### 步骤 1：导入组件

```tsx
import { SafeArea, SafeAreaHeader } from "components/safe-area";
// 或
import { SafeHeader, withSafeArea } from "components/with-safe-area";
```

### 步骤 2：替换现有代码

1. **自定义头部** → 使用 `SafeAreaHeader`
2. **全屏内容** → 使用 `SafeArea`
3. **整个页面** → 使用 `withSafeArea` HOC
4. **zmp-ui Header** → 无需修改

### 步骤 3：测试

在不同设备上测试页面显示效果，确保内容不被遮挡。

## 注意事项

1. **不要重复使用**：如果页面已经使用了 zmp-ui 的 Header，就不需要再使用 SafeArea 组件
2. **样式继承**：SafeArea 组件会保留原有的 className 和 style
3. **性能考虑**：组件使用 CSS 变量，性能开销很小
4. **向后兼容**：在不支持安全区域的设备上会自动回退到原有显示效果

## CSS 变量

组件依赖以下 CSS 变量（已在 Layout 组件中设置）：

- `--zaui-safe-area-inset-top`：顶部安全区域高度
- `--zaui-safe-area-inset-bottom`：底部安全区域高度
- `--zaui-safe-area-inset-left`：左侧安全区域宽度
- `--zaui-safe-area-inset-right`：右侧安全区域宽度
