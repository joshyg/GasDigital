/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "AppDelegate.h"
#import <Fabric/Fabric.h>
#import <Crashlytics/Crashlytics.h>

#import <CodePush/CodePush.h>

#import <React/RCTBundleURLProvider.h>
//#import <React/RCTRootView.h>
#import <React/RCTBridge.h>
#import <React/RCTEventDispatcher.h>
#import <React/RCTEventEmitter.h>
#import "Orientation.h" // <--- import
#import "SplashScreen.h"  // here

@implementation GSDEventEmitter

RCT_EXPORT_MODULE();

 - (NSArray<NSString *> *)supportedEvents {
   return @[@"RemotePlay",
            @"RemotePause",
            @"RemoteToggle",
            @"RemoteStop",
            @"RemoteNextTrack",
            @"RemotePreviousTrack",
            @"RemoteBeginSeekBackward",
            @"RemoteEndSeekBackward",
            @"RemoteBeginSeekForward",
            @"RemoteEndSeekForward"
            ];
 }                                                                                                

@end

@implementation AppDelegate

- (UIInterfaceOrientationMask)application:(UIApplication *)application supportedInterfaceOrientationsForWindow:(UIWindow *)window {
  return [Orientation getOrientation];
}

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  NSURL *jsCodeLocation;
  [Fabric with:@[[Crashlytics class]]];

  
    #ifdef DEBUG
        jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
        NSLog(@"jsCodeLocation = %@",jsCodeLocation);
    #else
        jsCodeLocation = [CodePush bundleURL];
    #endif

  RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
                                                      moduleName:@"GasDigitalRN"
                                               initialProperties:nil
                                                   launchOptions:launchOptions];
  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  
  [SplashScreen show];  // here
  return YES;
}

@end
