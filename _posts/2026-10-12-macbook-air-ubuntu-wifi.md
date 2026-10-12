---
layout: post
title: "Getting Wi-Fi working on a 2015 MacBook Air with Ubuntu 26.04"
date: 2026-10-12 15:43:00 +1000
tags: [linux, ubuntu, macbook, wifi]
---

I installed Ubuntu 26.04 on my early 2015 13" MacBook Air. Getting Wi-Fi working took a bit of fiddling, so I’m writing down what worked before I forget.

The laptop has a Broadcom BCM4360 wireless card. Ubuntu could see the hardware, but there was no Wi-Fi interface available.

## Which driver has the card?

The useful starting point was `lspci`:

```bash
lspci -nn | grep -i broadcom
lspci -k | grep -A4 -i network
```

Initially, the driver information showed:

```text
Kernel driver in use: bcma-pci-bridge
Kernel modules: bcma, wl
```

Later, it showed the available modules without a driver in use:

```text
Kernel modules: bcma, wl
```

Seeing `wl` listed under “Kernel modules” doesn’t mean it’s actually driving the card. That was a useful distinction while figuring out what was going on.

The configuration that worked used the proprietary Broadcom STA driver, `wl`.

## Getting enough internet to fix the internet

First, I needed a temporary connection to install the packages. iPhone USB tethering or Ethernet gets around the missing Wi-Fi.

I enabled the restricted repository and refreshed the package lists:

```bash
sudo add-apt-repository -y restricted
sudo apt update
```

Then removed the b43 firmware packages:

```bash
sudo apt purge -y b43-fwcutter firmware-b43-installer
```

And installed the STA driver:

```bash
sudo apt install -y broadcom-sta-dkms
```

## Blacklisting the other modules

I also explicitly blacklisted `b43` and `bcma`:

```bash
cat <<EOF | sudo tee /etc/modprobe.d/broadcom.conf
blacklist b43
blacklist bcma
EOF
```

Removing the firmware packages doesn’t remove these kernel modules, so the purge and blacklist do different jobs.

The STA package may already provide equivalent blacklist rules. I didn’t test whether my extra file was necessary; this is the sequence I used to get the machine working.

Then I rebuilt the initramfs and rebooted:

```bash
sudo update-initramfs -u
sudo reboot
```

After that, Wi-Fi appeared and worked. It also kept working through subsequent reboots.

## Checking the result

These commands were useful while sorting it out:

```bash
# Which driver is using the wireless card?
lspci -k | grep -A4 -i network

# Which Broadcom modules are loaded?
lsmod | grep -E 'wl|bcma|b43'

# Does NetworkManager have a Wi-Fi device?
nmcli device
```

Look for `wl` as the driver in use and a wireless device in NetworkManager. A module appearing in the list of possible drivers isn’t enough.

## Do it again after installing

I needed the fix in the live installer as well as the installed system.

Getting Wi-Fi working in the live session let me continue with the installation, but those changes didn’t carry over. I repeated the setup after booting into the installed copy of Ubuntu.

This worked on my BCM4360-equipped MacBook Air. If you’re trying it on another Mac, check the actual wireless chipset first—different models use different cards.

For mine, `lspci` was the useful starting point: Ubuntu could see the card, and checking which driver had claimed it gave me something concrete to investigate.
