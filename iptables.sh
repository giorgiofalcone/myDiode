#!/bin/bash

# define variables

ETH_WAN="eth1"
ETH_LAN="eth0"
EXTERNAL_IP="10.2.240.10"

# clean old configs

/sbin/iptables -F
/sbin/iptables -t nat -F

# FILTER table

# allow ssh only on external ip
/sbin/iptables -A INPUT -i "$ETH_WAN" -d "$EXTERNAL_IP" -p tcp --dport 22 -j ACCEPT

# allow tcp response
/sbin/iptables -A INPUT -i "$ETH_WAN" -p tcp -m state --state ESTABLISHED -j ACCEPT
# allow ping response
/sbin/iptables -A INPUT -i "$ETH_WAN" -p icmp --icmp-type 0 -j ACCEPT
# allow dns response
/sbin/iptables -A INPUT -i "$ETH_WAN" -p udp --sport 53 -j ACCEPT
# drop everything else
/sbin/iptables -A INPUT -i "$ETH_WAN" -j DROP

# allow dns queries
/sbin/iptables -A OUTPUT -o "$ETH_WAN" -p udp --dport 53 -j ACCEPT

# forward dns query from lan to wan
/sbin/iptables -A FORWARD -i "$ETH_LAN" -o "$ETH_WAN" -p udp --dport 53 -j ACCEPT
# forward dns response from wan to lan
/sbin/iptables -A FORWARD -i "$ETH_WAN" -o "$ETH_LAN" -p udp --sport 53 -j ACCEPT
# forward icmp protol from lan to wan
/sbin/iptables -A FORWARD -i "$ETH_LAN" -o "$ETH_WAN" -p icmp -j ACCEPT
# forward ping response from wan to lan
/sbin/iptables -A FORWARD -i "$ETH_WAN" -o "$ETH_LAN" -p icmp --icmp-type 0 -j ACCEPT
# forward tcp connection RELATED,ESTABLISHED from wan to lan
/sbin/iptables -A FORWARD -i "$ETH_WAN" -o "$ETH_LAN" -p tcp -m state --state RELATED,ESTABLISHED -j ACCEPT
# forward everything from lan to wan
/sbin/iptables -A FORWARD -i "$ETH_LAN" -o "$ETH_WAN" -j ACCEPT
# drop everything from wan to lan
/sbin/iptables -A FORWARD -i "$ETH_WAN" -o "$ETH_LAN" -j DROP

# NAT table

# natta everything transits from wan port
/sbin/iptables -t nat -A POSTROUTING -o "$ETH_WAN" -j MASQUERADE