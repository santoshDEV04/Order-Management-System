$ErrorActionPreference = "Stop"
Write-Host "=== RBAC Food Delivery Seed Script ==="

# Step 1: Login as Admin
$loginBody = '{"email":"dashsantosh2004@gmail.com","password":"Admin@123"}'
$loginResp = Invoke-RestMethod -Uri 'http://localhost:5000/api/v1/users/login' -Method POST -Body $loginBody -ContentType 'application/json'
$adminToken = $loginResp.data.accessToken
if (-not $adminToken) { $adminToken = $loginResp.message.accessToken }
Write-Host "Admin logged in."
$hdrs = @{ Authorization = "Bearer $adminToken"; "Content-Type" = "application/json" }

# Step 2: Get users
$usersResp = Invoke-RestMethod -Uri 'http://localhost:5000/api/v1/users/all-users' -Headers $hdrs
$users = $usersResp.data
$indiaManagers = @($users | Where-Object { $_.role -eq "MANAGER" -and $_.country -eq "INDIA" })
$americaManagers = @($users | Where-Object { $_.role -eq "MANAGER" -and $_.country -eq "AMERICA" })
Write-Host "India Managers: $($indiaManagers.Count), America Managers: $($americaManagers.Count)"

# Create demo managers using admin endpoint if missing
if ($indiaManagers.Count -eq 0) {
    try { Invoke-RestMethod -Uri 'http://localhost:5000/api/v1/users/create-manager' -Method POST -ContentType 'application/json' -Headers $hdrs -Body '{"name":"Captain Marvel","email":"captainmarvel@india.com","password":"Manager@123","country":"INDIA"}' | Out-Null; Write-Host "Created India manager." } catch { Write-Host "India manager exists or failed." }
}
if ($americaManagers.Count -eq 0) {
    try { Invoke-RestMethod -Uri 'http://localhost:5000/api/v1/users/create-manager' -Method POST -ContentType 'application/json' -Headers $hdrs -Body '{"name":"Captain America","email":"captainamerica@america.com","password":"Manager@123","country":"AMERICA"}' | Out-Null; Write-Host "Created America manager." } catch { Write-Host "America manager exists or failed." }
}

# Reload managers
$usersResp2 = Invoke-RestMethod -Uri 'http://localhost:5000/api/v1/users/all-users' -Headers $hdrs
$users2 = $usersResp2.data
$indiaManagers = @($users2 | Where-Object { $_.role -eq "MANAGER" -and $_.country -eq "INDIA" })
$americaManagers = @($users2 | Where-Object { $_.role -eq "MANAGER" -and $_.country -eq "AMERICA" })

# Step 3: Get existing restaurant names
$existingResp = Invoke-RestMethod -Uri 'http://localhost:5000/api/v1/resturants' -Headers $hdrs
$existingNames = @($existingResp.data | ForEach-Object { $_.name })
Write-Host "Existing restaurants: $($existingNames -join ', ')"

function Add-Restaurant($name, $address, $country, $managerId, $menus) {
    if ($existingNames -contains $name) { Write-Host "Skip: $name (exists)"; return }
    $body = "{`"name`":`"$name`",`"address`":`"$address`",`"country`":`"$country`",`"manager`":`"$managerId`"}"
    try {
        $r = Invoke-RestMethod -Uri 'http://localhost:5000/api/v1/resturants' -Method POST -Body $body -Headers $hdrs
        $rid = $r.data._id
        Write-Host "Created: $name [$country]"
        foreach ($m in $menus) {
            $mb = "{`"name`":`"$($m.name)`",`"description`":`"$($m.desc)`",`"price`":$($m.price)}"
            Invoke-RestMethod -Uri "http://localhost:5000/api/v1/menu/$rid" -Method POST -Body $mb -Headers $hdrs | Out-Null
            Write-Host "  + $($m.name) `$$($m.price)"
        }
    } catch { Write-Host "Error creating $name`: $($_.Exception.Message)" }
}

# India Restaurants
if ($indiaManagers.Count -gt 0) {
    $im = $indiaManagers[0]._id
    Add-Restaurant "Spice Garden" "12 MG Road, Bangalore, Karnataka" "INDIA" $im @(
        @{name="Butter Chicken";desc="Creamy tomato-based curry with tender chicken";price=8.99}
        @{name="Garlic Naan";desc="Soft leavened bread with garlic and butter";price=2.49}
        @{name="Dal Makhani";desc="Slow-cooked black lentils in rich buttery gravy";price=6.99}
        @{name="Paneer Tikka";desc="Chargrilled cottage cheese with spiced marinade";price=7.49}
        @{name="Mango Lassi";desc="Chilled yogurt drink blended with Alphonso mango";price=3.29}
    )
    $im2 = if ($indiaManagers.Count -gt 1) { $indiaManagers[1]._id } else { $indiaManagers[0]._id }
    Add-Restaurant "Mumbai Bites" "45 Juhu Beach Road, Mumbai, Maharashtra" "INDIA" $im2 @(
        @{name="Vada Pav";desc="Spiced potato fritter in a soft bun - Mumbai street food";price=1.99}
        @{name="Pav Bhaji";desc="Buttery mashed vegetable curry with toasted buns";price=5.49}
        @{name="Chicken Biryani";desc="Fragrant basmati rice with marinated chicken and saffron";price=9.99}
        @{name="Samosa Chaat";desc="Crispy pastry with chickpeas, chutneys and yogurt";price=4.29}
        @{name="Cutting Chai";desc="Strong half-cup Indian spiced tea, a Mumbai staple";price=1.49}
    )
    Add-Restaurant "Delhi Darbar" "18 Connaught Place, New Delhi" "INDIA" $im @(
        @{name="Tandoori Chicken";desc="Chicken marinated in yogurt and spices, clay oven cooked";price=11.99}
        @{name="Seekh Kebab";desc="Minced lamb kebab on skewers with fresh herbs";price=8.49}
        @{name="Chole Bhature";desc="Spicy chickpeas served with deep-fried puffed bread";price=5.99}
        @{name="Raita";desc="Chilled yogurt with cucumber and cumin";price=2.49}
        @{name="Gulab Jamun";desc="Milk-solid dumplings soaked in rose-flavored sugar syrup";price=3.49}
    )
}

# America Restaurants
if ($americaManagers.Count -gt 0) {
    $am = $americaManagers[0]._id
    Add-Restaurant "Liberty Burgers" "88 5th Avenue, New York, NY" "AMERICA" $am @(
        @{name="Classic Smash Burger";desc="Double smashed beef patty, American cheese, house sauce";price=12.99}
        @{name="BBQ Bacon Burger";desc="Crispy bacon, cheddar, onion rings and smoky BBQ sauce";price=14.49}
        @{name="Truffle Fries";desc="Crispy shoestring fries tossed in truffle oil and Parmesan";price=5.99}
        @{name="Vanilla Milkshake";desc="Thick hand-spun shake with real vanilla bean ice cream";price=6.49}
        @{name="Onion Rings";desc="Beer-battered golden onion rings with chipotle dip";price=4.99}
    )
    $am2 = if ($americaManagers.Count -gt 1) { $americaManagers[1]._id } else { $americaManagers[0]._id }
    Add-Restaurant "Pizza Republic" "224 Sunset Blvd, Los Angeles, CA" "AMERICA" $am2 @(
        @{name="Margherita Pizza";desc="San Marzano tomatoes, fresh mozzarella, basil on thin crust";price=13.99}
        @{name="Pepperoni Feast";desc="Double-layer pepperoni with mozzarella and tomato sauce";price=15.99}
        @{name="BBQ Chicken Pizza";desc="Grilled chicken, red onion, mozzarella and BBQ sauce base";price=16.49}
        @{name="Caesar Salad";desc="Romaine lettuce, shaved Parmesan, croutons, Caesar dressing";price=7.99}
        @{name="Garlic Bread Sticks";desc="Warm butter-brushed breadsticks with marinara dipping sauce";price=5.49}
    )
}

Write-Host ""
Write-Host "=== SEED COMPLETE ==="
