---
title: "Kerberoasting"
date: 2026-03-14
draft: false
featureimage: "cover.jpg"
images:
  - "social.jpg"
summary: "An overview of Kerberoasting, an attack on Kerberos service accounts, including how it works and methods for detecting suspicious ticket requests."
tags: ["siem", "threat-hunting", "detection", "soc"]
---

# **Exploring Kerberoasting in Active Directory**


## **What is a Kerberoasting attack?**

Kerberoasting is a post exploitation attack in Active Directory Environment that targets the Kerberos Authentication Protocol, the goal of the attacker “who has gained user-level access” to get a Service Ticket that belong to service accounts to cracks it offline and extract the encrypted service account credentials.

The attack targets **accounts associated with services** such as:

- SQL Server
- IIS web services
- Backup services
- Application services

These accounts are usually tied to **Service Principal Names (SPNs)** in Active Directory.




{{< figure
    src="figure1.png"
    alt="Active Directory Authentication Flow"
    caption="Active Directory Authentication Flow"
    >}}

The Kerberos Authentication in Active Directory (AD) relies on Key Distribution Center (KDC) which is located in Domain Controller (DC), the KDC contains two logical services: 

- **Authentication Service (AS)**: Before a client can ask for a ticket to another computer, it must request a “TGT” from the “Authentication Service” in the client's account domain. the client will sends an Authentication Service Request (AS-REQ) to the Authentication Service for the initial authentication, then the Authentication Service “AS” will verify the user’s credentials, if the authentication succeeds, the AS issues a Ticket Granting Ticket (TGT) to the client.
- **Ticket Granting Service (TGS)**: This service issues tickets for connection to computers in its own domain. When clients want access to a computer, they contact the ticket granting service (TGS) in the target computer's domain, present a TGT, and ask for a ticket to the computer.


In Active Directory the services such as (databases, web servers, file servers) are identified by using a Service Principal Names (SPNs) which is a unique identifier that links a specific service instance to the account running it. Example: "HTTP/iis.lab.local” .

**The normal process that occurs when a user requests access to a service:**

1. The user authenticates with the Key Distribution Centre using an AS-REQ packet.
2. The KDC validates the user credentials and if valid, returns a Ticket Granting Ticket (TGT).
3. When the user wants to authenticate to a service such as IIS, a request is made to the Ticket Granting Service (TGS) containing the TGT and the Service Principal Name (SPN) of the service to be accessed.
4. If the TGT is valid and has not expired, a TGS creates a service ticket for the target service. The service ticket is encrypted with the credentials of the service account.
5. A TGS response is sent to the user with the encrypted service ticket.
6. The service ticket is finally forwarded to the service, which is decrypted by the using the service account credentials.

When the Ticket Grating Service (TGS) generates a Service Ticket (ST) to the client, the special feature of the service ticket (ST) is that part of it is encrypted. This part is encrypted using a symmetric encryption algorithm and a derivative of the service account password which means any authenticated user on a Windows domain with the ability to request a service ticket from the TGS to perform an offline bruteforce attack on the encrypted ticket.

## **Kerberoasting attack flow**

1. **Obtain Domain User Account**
   * in first the attacker needs to gain access to any valid domain user account in Active Directory environment. This doesn’t require any administrative privilege, because any authenticated user can interact with Kerberos Services.
2. **Enumerate Accounts with SPNs**
   * identifying the accounts with registered Service Principal Names (SPNs) allows to determine which services are running under those accounts.
3. **Request a Service Ticket  and receive it Encrypted with the hash of the service account**
4. **Perform Offline Password Cracking and use the service account credentials.**
   * An adversary’s first step will likely be to identify what privileges (if any) are now available by way of this newly compromised account and determine if this account has access to any other system that might be of interest. For example, a successful Kerberoast against a webserver’s service account would grant the adversary permissions to interact with an associated database.
   
   {{< figure
    src="figure2.jpg"
    alt="Kerberoasting Attack Flow"
    caption="Kerberoasting Attack Flow"
    >}}
	
	
## **Protecting Active Directory Against Kerberoasting**

- **Use a Strong and complex passwords for Service Accounts.**
    - Since the Kerberoasting relies on offline cracking, complex passwords will make the attack much harder
- **Use Group Managed Service Accounts (gMSA)**
    - A Group Managed Service Account (gMSA) is a specific type of Windows Server Active Directory account. It is designed to secure services that run across multiple servers in a distributed environment. gMSAs solve the administrative and security challenges posed by traditional service accounts by automating password management and simplifying Service Principal Name (SPN) handling.
- **Apply Least Privilege and avoid assigning high privileges such Domain Admins.**
- **Consider disabling RC4 as an encryption type.**

## **Kerberoasting Detection**

### **Event ID 4769 - A Kerberos service ticket was requested**

To hunt for Kerberoasting activity, we need to pay attention to Event Id 4769.

- **Event ID 4769**: Generated on Domain Controllers when the Key Distribution Center (KDC) issues a Kerberos service ticket (TGS) for a user or computer account to access a network service.

   {{< figure
    src="figure3.png"
    alt="Event 4769 - (A Kerberos Service Ticket was Requested)"
    caption="Event 4769 - (A Kerberos Service Ticket was Requested)"
    >}}
	
**The key pieces of information we are looking for Kerberoasting activity are:**

- **Encryption type**: This field shows the encryption algorithm used for the ticket. It can help reduce noise and highlight tickets that are more likely related to Kerberoasting. Attackers often target weaker or crackable encryption types. **Pay attention to 0x17 (RC4-HMAC) since it is commonly used in Kerberoasting attacks because it is easier to crack offline.** In some cases, 0x1 or 0x3 (DES) may appear if legacy encryption is enabled.
- **Service name**: This field represent the service account name that associated with the requested Service Ticket. If Kerberoasting is successful, this account’s password hash can potentially be cracked offline. By reviewing this field helps identify which service account may be targeted in this attack. In investigation it's useful for filtering noise, such as computer accounts that typically end with $.
- **Client address**: The IP address of the machine that requested the Service Ticket. This helps identify the source machine who generated that request. If Kerberoasting activity is suspected, this system may be compromised or used by an attacker. And it helpful to check the volume of TGS requests that generated by this IP, because if found a High volume of TGS requests for multiple SPNs from the same account or host/IP it might indicate an automated Kerberoasting tool.
- **Account name**: User that requested the Service Ticket. This will indicate a compromised account and warrants further investigation if the ticket is found to be related to Kerberoasting.


### **SPN Enumeration and Kerberoasting Tool Usage**

Kerberoasting attacks usually starts with enumerating the **Service Principal Names (SPNs)** to find service accounts in Active Directory. Attackers query the **servicePrincipalName** attribute via LDAP to identify any service related accounts before requesting Kerberos service tickets for offline password cracking.

A **sudden spike in SPN-related queries within a short period of time** may indicate reconnaissance activity preceding a Kerberoasting attempt.

Attackers frequently leverage well-known offensive tooling to automate SPN discovery and Kerberos ticket extraction. Common tools observed in Kerberoasting activity include **Rubeus, Impacket (GetUserSPNs.py), and PowerView / Invoke-Kerberoast**. Detection rules can monitor **process creation events (Event ID 4688 / 1)** as well as **Powershell script block logging (Event ID 4104)** for executions containing these tool names or associated command-line arguments.





{{< figure
    src="invoke-kerberoast.png"
    alt="PowerView Invoke-Kerberoast extracting a Kerberos service ticket hash for a Kerberoasting attack."
    caption="PowerView Invoke-Kerberoast extracting a Kerberos service ticket hash for a Kerberoasting attack."
    >}}
	
{{< figure
    src="rubeus.png"
    alt="Rubeus executing kerberoast in Windows PowerShell to retrieve a Kerberos service ticket hash for a Kerberoasting attack."
    caption="Rubeus executing kerberoast in Windows PowerShell to retrieve a Kerberos service ticket hash for a Kerberoasting attack."
    >}}

In addition, suspicious usage of **native utilities and PowerShell commands** capable of enumerating SPNs should also be monitored. Examples include the use of **setspn or queries performed through the Active Directory PowerShell module** to retrieve accounts with the servicePrincipalName attribute. When such activity originates from **non-administrative workstations**, it may indicate reconnaissance activity preceding a Kerberoasting attempt.

{{< figure
    src="setspn.png"
    alt="setspn command"
    caption="setspn command"
    >}}


**Common commands seen during the preparation phase of Kerberoasting include:**
```yaml
# PowerView SPN enumeration
Get-DomainUser -SPN

# Invoke-Kerberoast
Invoke-Kerberoast

# Impacket Kerberoasting
GetUserSPNs.py domain.local/user:password -dc-ip <DC_IP>

# setspn utility
setspn -T domain.local -Q */*

# PowerShell Active Directory modules:
Get-ADUser -Filter {ServicePrincipalName -ne "$null"} -Properties ServicePrincipalName
```




## **References and Further Reading**

**Additional resources and references are provided below for further reading. The following sources were referenced during the preparation of this article and include detailed explanations of Kerberoasting techniques, along with example threat detection rules that may assist in developing or refining detection logic.** 🔎


- [MITRE ATT&CK – Kerberoasting](https://attack.mitre.org/techniques/T1558/003/ "Kerberoasting technique in MITRE ATT&CK")

- [Kerberoasting Activity - Initial Query](https://detection.fyi/sigmahq/sigma/windows/builtin/security/win_security_kerberoasting_activity/)
- [Suspicious Kerberos Ticket Request via CLI](https://detection.fyi/sigmahq/sigma/windows/process_creation/proc_creation_win_powershell_kerberos_kerberos_ticket_request_via_cli/)
- [Suspicious Kerberos RC4 Ticket Encryption](https://detection.fyi/sigmahq/sigma/windows/builtin/security/win_security_susp_rc4_kerberos/)
- [sigma-public/rules/windows/process_creation/win_hack_rubeus.yml at master · NVISOsecurity/sigma-public](https://github.com/NVISOsecurity/sigma-public/blob/master/rules/windows/process_creation/win_hack_rubeus.yml)
- [sigma/rules/windows/process_creation/proc_creation_win_hktl_rubeus.yml at master · SigmaHQ/sigma](https://github.com/SigmaHQ/sigma/blob/master/rules/windows/process_creation/proc_creation_win_hktl_rubeus.yml)
- <https://redsiege.com/tools-techniques/2020/10/detecting-kerberoasting/>
- [What Is SPN and What is It's Role in Active Directory and Security](https://netwrix.com/en/resources/blog/what-is-spn/)
- [Kerberos AD Attacks - Kerberoasting](https://blog.xpnsec.com/kerberos-attacks-part-1/)
- [DFIR Breakdown: Kerberoasting](https://www.cybertriage.com/blog/dfir-breakdown-kerberoasting/)
- [What is Kerberoasting? Attack and Security Tips Explained](https://www.vaadata.com/blog/what-is-kerberoasting-attack-and-security-tips-explained/)
- [What is Kerberoasting?](https://redcanary.com/blog/threat-detection/marshmallows-and-kerberoasting/)
- [Kerberoasting attack detection](https://www.hackthebox.com/blog/kerberoasting-attack-detection)
- [Kerberoasting Attack - Detection and Prevention Strategies | Netwrix](https://netwrix.com/en/cybersecurity-glossary/cyber-security-attacks/kerberoasting/)
- [gMSA Guide: Group Managed Service Account Security &amp; Deployment | Varonis](https://www.varonis.com/blog/gmsa)
- [4769(S, F) A Kerberos service ticket was requested. - Windows 10](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/event-4769)
- <https://www.fox-it.com/nl-en/defending-your-directory-an-expert-guide-to-combating-kerberoasting-in-active-directory/>
- [Suspicious Kerberos Authentication Ticket Request | Elastic Security ](https://www.elastic.co/guide/en/security/8.19/suspicious-kerberos-authentication-ticket-request.html)
- [Impacket GetUserSPNs &amp; Kerberoasting Explained](https://www.youtube.com/watch?v=xH5T9-m9QXw)
- [Kerberoasting - Exploiting Kerberos to Compromise Microsoft Active Directory | Bureau Veritas Cybersecurity](https://cybersecurity.bureauveritas.com/blog/kerberoasting-exploiting-kerberos-to-compromise-microsoft-active-directory)